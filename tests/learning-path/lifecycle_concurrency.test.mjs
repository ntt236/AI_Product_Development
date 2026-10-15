import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * In-memory representation of learning path database operations to test:
 * - State transitions & invalid transitions
 * - Progressive unlock states (Milestone 1, Module 1, Topic 1)
 * - Optimistic concurrency control (expected_version vs current_version)
 * - Single active path per user invariant
 * - IDOR & cross-path tampering protection
 * - Atomic structure customization (positions + snapshot succeed/fail together)
 * - Anti-tampering: Direct client table mutation denial
 */

class MockLearningPathDB {
  constructor() {
    this.paths = new Map();
    this.items = new Map();
    this.versions = new Map();
  }

  insertPath(path) {
    const id = path.id || `path-${Date.now()}-${Math.random()}`;
    const newPath = {
      id,
      user_id: path.user_id,
      goal_id: path.goal_id || null,
      title: path.title,
      description: path.description,
      target_level: path.target_level || 'a2',
      total_estimated_minutes: path.total_estimated_minutes || 0,
      estimated_weeks: path.estimated_weeks || 1,
      status: path.status || 'proposed',
      is_user_modified: false,
      current_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.paths.set(id, newPath);

    // Initial version snapshot
    const versionId = `v-${id}-1`;
    this.versions.set(versionId, {
      id: versionId,
      learning_path_id: id,
      version_number: 1,
      change_reason: 'Initial creation',
      created_by: 'system',
      snapshot: { ...newPath },
      created_at: new Date().toISOString(),
    });

    return newPath;
  }

  insertItem(item) {
    const id = item.id || `item-${Date.now()}-${Math.random()}`;
    const newItem = {
      id,
      learning_path_id: item.learning_path_id,
      parent_id: item.parent_id || null,
      item_type: item.item_type, // 'milestone' | 'module' | 'topic'
      title: item.title,
      description: item.description || '',
      skill: item.skill || null,
      position: item.position || 1,
      estimated_minutes: item.estimated_minutes || 20,
      content_status: item.content_status || 'planned_curriculum',
      status: item.status || 'locked',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.items.set(id, newItem);
    return newItem;
  }

  getPath(pathId) {
    return this.paths.get(pathId) || null;
  }

  getItems(pathId) {
    return Array.from(this.items.values())
      .filter((it) => it.learning_path_id === pathId)
      .sort((a, b) => a.position - b.position);
  }

  getVersions(pathId) {
    return Array.from(this.versions.values()).filter((v) => v.learning_path_id === pathId);
  }

  /**
   * Direct Client Mutation (should be denied by RLS/Grants for authenticated role)
   */
  directClientUpdate(role, table, id, updates) {
    if (role === 'authenticated' || role === 'anon') {
      return { success: false, error: 'Permission denied: direct table mutation revoked for authenticated/anon.' };
    }
    if (table === 'learning_paths') {
      const p = this.paths.get(id);
      if (p) Object.assign(p, updates);
    }
    return { success: true };
  }

  /**
   * State Transition: Accept path & progressive unlock
   */
  acceptPath(userId, pathId) {
    const path = this.paths.get(pathId);
    if (!path || path.user_id !== userId) {
      return { success: false, error: 'Không tìm thấy lộ trình hoặc bạn không có quyền.' };
    }

    if (path.status === 'active') {
      return { success: true };
    }

    if (path.status !== 'proposed' && path.status !== 'paused') {
      return {
        success: false,
        error: `Không thể kích hoạt lộ trình đang ở trạng thái ${path.status}.`,
      };
    }

    // Invariant: Archive any existing active path for this user
    for (const [_, p] of this.paths) {
      if (p.user_id === userId && p.status === 'active' && p.id !== pathId) {
        p.status = 'archived';
        p.updated_at = new Date().toISOString();
      }
    }

    path.status = 'active';
    path.updated_at = new Date().toISOString();

    // Progressive Unlock: Milestone 1 -> Module 1 -> Topic 1
    const items = this.getItems(pathId);
    const m1 = items.find((i) => i.item_type === 'milestone' && i.position === 1);
    if (m1) {
      m1.status = 'available';
      const mod1 = items.find((i) => i.item_type === 'module' && i.parent_id === m1.id && i.position === 1);
      if (mod1) {
        mod1.status = 'available';
        const t1 = items.find((i) => i.item_type === 'topic' && i.parent_id === mod1.id && i.position === 1);
        if (t1) {
          t1.status = 'available';
        }
      }
    }

    return { success: true };
  }

  /**
   * State Transition: Reject path
   */
  rejectPath(userId, pathId) {
    const path = this.paths.get(pathId);
    if (!path || path.user_id !== userId) {
      return { success: false, error: 'Không tìm thấy lộ trình.' };
    }

    if (path.status !== 'proposed') {
      return {
        success: false,
        error: 'Chỉ có thể từ chối lộ trình đang ở trạng thái đề xuất.',
      };
    }

    path.status = 'rejected';
    path.updated_at = new Date().toISOString();
    return { success: true };
  }

  /**
   * State Transition: Pause path
   */
  pausePath(userId, pathId) {
    const path = this.paths.get(pathId);
    if (!path || path.user_id !== userId) {
      return { success: false, error: 'Không tìm thấy lộ trình.' };
    }

    if (path.status !== 'active') {
      return {
        success: false,
        error: 'Chỉ có thể tạm dừng lộ trình đang hoạt động.',
      };
    }

    path.status = 'paused';
    path.updated_at = new Date().toISOString();
    return { success: true };
  }

  /**
   * Atomic Customization: Optimistic concurrency, tree validation, position updates & snapshot
   */
  customizePath(userId, pathId, expectedVersion, changeReason, reorderedIds) {
    const path = this.paths.get(pathId);
    if (!path || path.user_id !== userId) {
      return { success: false, error: 'Không tìm thấy lộ trình hoặc không có quyền.' };
    }

    if (path.status === 'completed' || path.status === 'rejected' || path.status === 'archived') {
      return {
        success: false,
        error: `Không thể chỉnh sửa cấu trúc của lộ trình đã kết thúc hoặc lưu trữ (${path.status}).`,
      };
    }

    // 1. Optimistic Concurrency Check
    if (path.current_version !== expectedVersion) {
      return {
        success: false,
        error: `Xung đột phiên bản: Lộ trình đã được cập nhật (v${path.current_version} khác v${expectedVersion}).`,
      };
    }

    // 2. Validate input array: non-empty check
    if (!reorderedIds || reorderedIds.length === 0) {
      return { success: false, error: 'Danh sách hạng mục tùy chỉnh không được để trống.' };
    }

    // 3. Reject duplicate item IDs in reorderedIds
    if (new Set(reorderedIds).size !== reorderedIds.length) {
      return {
        success: false,
        error: 'Danh sách hạng mục tùy chỉnh chứa ID bị trùng lặp.',
      };
    }

    // 4. Validate all reordered item IDs belong to this path (anti-cross-path tampering)
    const existingItems = this.getItems(pathId);
    const validMap = new Map(existingItems.map((i) => [i.id, i]));
    for (const itemId of reorderedIds) {
      if (!validMap.has(itemId)) {
        return {
          success: false,
          error: `Phát hiện hạng mục không hợp lệ hoặc thuộc lộ trình khác: ${itemId}`,
        };
      }
    }

    // 5. Validate single sibling group contract & anti-cross-parent tampering
    const firstItem = validMap.get(reorderedIds[0]);
    const targetParentId = firstItem.parent_id;
    const targetType = firstItem.item_type;

    for (const itemId of reorderedIds) {
      const item = validMap.get(itemId);
      if (item.item_type !== targetType) {
        return {
          success: false,
          error: 'Không thể sắp xếp đồng thời các hạng mục ở các cấp phân cấp khác nhau.',
        };
      }
      if (item.parent_id !== targetParentId) {
        return {
          success: false,
          error: 'Không thể sắp xếp các hạng mục thuộc các hạng mục cha khác nhau (Cross-parent reordering).',
        };
      }
    }

    // 6. Completeness check: Ensure omitted items cannot accidentally retain conflicting positions
    const allSiblings = existingItems.filter(
      (it) => it.parent_id === targetParentId && it.item_type === targetType
    );
    if (allSiblings.length !== reorderedIds.length) {
      return {
        success: false,
        error: `Danh sách tùy chỉnh phải bao gồm toàn bộ ${allSiblings.length} hạng mục trong cùng nhóm cha (nhận được: ${reorderedIds.length}).`,
      };
    }

    // 7. Atomically update positions
    let pos = 1;
    for (const itemId of reorderedIds) {
      const item = this.items.get(itemId);
      if (item) {
        item.position = pos++;
        item.updated_at = new Date().toISOString();
      }
    }

    const newVersion = path.current_version + 1;
    const now = new Date().toISOString();

    // 8. Construct deterministic hierarchical snapshot from actual updated DB items
    const refreshedItems = this.getItems(pathId);
    const milestones = refreshedItems
      .filter((it) => it.item_type === 'milestone')
      .sort((a, b) => a.position - b.position)
      .map((m) => {
        const modules = refreshedItems
          .filter((mod) => mod.parent_id === m.id && mod.item_type === 'module')
          .sort((a, b) => a.position - b.position)
          .map((mod) => {
            const topics = refreshedItems
              .filter((t) => t.parent_id === mod.id && t.item_type === 'topic')
              .sort((a, b) => a.position - b.position)
              .map((t) => ({ ...t }));
            return { ...mod, topics };
          });
        return { ...m, modules };
      });

    const versionId = `v-${pathId}-${newVersion}`;
    this.versions.set(versionId, {
      id: versionId,
      learning_path_id: pathId,
      version_number: newVersion,
      change_reason: changeReason || 'Người học tùy chỉnh cấu trúc lộ trình',
      created_by: 'user',
      snapshot: {
        title: path.title,
        version_number: newVersion,
        milestones,
        reordered_ids: reorderedIds,
        previous_version: expectedVersion,
        timestamp: now,
      },
      created_at: now,
    });

    // 9. Update path version
    path.current_version = newVersion;
    path.is_user_modified = true;
    path.updated_at = now;

    return { success: true, newVersion };
  }
}

describe('Learning Path Lifecycle, Security & Concurrency Engine', () => {
  let db;
  const userA = 'user-uuid-1111';
  const userB = 'user-uuid-2222';

  beforeEach(() => {
    db = new MockLearningPathDB();
  });

  describe('1. State Transition Rules & Progressive Unlocking', () => {
    it('allows proposed path to transition to active and unlocks Milestone 1, Module 1, and Topic 1', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'TOEIC Prep Path',
        status: 'proposed',
        target_level: 'b1',
      });

      // Insert hierarchy
      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', position: 1, status: 'locked' });
      const m2 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', position: 2, status: 'locked' });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 1, status: 'locked' });
      const mod2 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 2, status: 'locked' });
      const t1 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 1, status: 'locked' });
      const t2 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 2, status: 'locked' });

      const res = db.acceptPath(userA, path.id);
      assert.equal(res.success, true);
      assert.equal(db.getPath(path.id).status, 'active');

      // Check progressive unlock states
      assert.equal(db.items.get(m1.id).status, 'available');
      assert.equal(db.items.get(mod1.id).status, 'available');
      assert.equal(db.items.get(t1.id).status, 'available');

      // Subsequent items MUST remain locked
      assert.equal(db.items.get(m2.id).status, 'locked');
      assert.equal(db.items.get(mod2.id).status, 'locked');
      assert.equal(db.items.get(t2.id).status, 'locked');
    });

    it('allows active path to be paused and subsequently resumed', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'TOEIC Prep Path',
        status: 'proposed',
      });

      db.acceptPath(userA, path.id);
      assert.equal(db.getPath(path.id).status, 'active');

      // Pause
      const pauseRes = db.pausePath(userA, path.id);
      assert.equal(pauseRes.success, true);
      assert.equal(db.getPath(path.id).status, 'paused');

      // Resume
      const resumeRes = db.acceptPath(userA, path.id);
      assert.equal(resumeRes.success, true);
      assert.equal(db.getPath(path.id).status, 'active');
    });

    it('allows proposed path to be rejected (terminal state)', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'Proposed Path',
        status: 'proposed',
      });

      const res = db.rejectPath(userA, path.id);
      assert.equal(res.success, true);
      assert.equal(db.getPath(path.id).status, 'rejected');

      // Cannot re-activate a rejected path
      const tryActivate = db.acceptPath(userA, path.id);
      assert.equal(tryActivate.success, false);
      assert.match(tryActivate.error, /Không thể kích hoạt lộ trình đang ở trạng thái rejected/);
    });

    it('cannot pause a proposed path directly', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'Proposed Path',
        status: 'proposed',
      });

      const res = db.pausePath(userA, path.id);
      assert.equal(res.success, false);
      assert.match(res.error, /Chỉ có thể tạm dừng lộ trình đang hoạt động/);
    });
  });

  describe('2. Single Active Path Invariant & Concurrency', () => {
    it('automatically archives an existing active path when accepting a new proposed path', () => {
      const path1 = db.insertPath({
        user_id: userA,
        title: 'Old Path 1',
        status: 'proposed',
      });
      db.acceptPath(userA, path1.id);
      assert.equal(db.getPath(path1.id).status, 'active');

      // Create and accept Path 2
      const path2 = db.insertPath({
        user_id: userA,
        title: 'New Path 2',
        status: 'proposed',
      });
      const res = db.acceptPath(userA, path2.id);
      assert.equal(res.success, true);

      // Path 1 must now be archived, Path 2 is active
      assert.equal(db.getPath(path1.id).status, 'archived');
      assert.equal(db.getPath(path2.id).status, 'active');

      // Exactly 1 path is active
      const activePaths = Array.from(db.paths.values()).filter(
        (p) => p.user_id === userA && p.status === 'active'
      );
      assert.equal(activePaths.length, 1);
    });
  });

  describe('3. Ownership, IDOR & Anti-Tampering Protection', () => {
    it('prevents User B from accepting User A’s path', () => {
      const pathA = db.insertPath({
        user_id: userA,
        title: 'User A Path',
        status: 'proposed',
      });

      const res = db.acceptPath(userB, pathA.id);
      assert.equal(res.success, false);
      assert.match(res.error, /Không tìm thấy lộ trình hoặc bạn không có quyền/);
      assert.equal(db.getPath(pathA.id).status, 'proposed');
    });

    it('prevents User B from customizing User A’s path', () => {
      const pathA = db.insertPath({
        user_id: userA,
        title: 'User A Path',
        status: 'proposed',
      });

      const res = db.customizePath(userB, pathA.id, 1, 'Hacked', ['id-1']);
      assert.equal(res.success, false);
      assert.match(res.error, /không có quyền/);
      assert.equal(db.getPath(pathA.id).current_version, 1);
    });

    it('rejects cross-path item tampering (injecting item ID from another path)', () => {
      const pathA = db.insertPath({ user_id: userA, title: 'Path A' });
      const pathB = db.insertPath({ user_id: userB, title: 'Path B' });

      const itemA = db.insertItem({ learning_path_id: pathA.id, item_type: 'topic', position: 1 });
      const itemB = db.insertItem({ learning_path_id: pathB.id, item_type: 'topic', position: 1 });

      // User A tries to customize pathA using itemB's ID from pathB
      const res = db.customizePath(userA, pathA.id, 1, 'Tampered edit', [itemB.id, itemA.id]);
      assert.equal(res.success, false);
      assert.match(res.error, /Phát hiện hạng mục không hợp lệ hoặc thuộc lộ trình khác/);

      // Verify no changes made to pathA or item positions (atomic failure)
      assert.equal(db.getPath(pathA.id).current_version, 1);
      assert.equal(db.items.get(itemA.id).position, 1);
    });

    it('denies direct table mutation for role authenticated', () => {
      const pathA = db.insertPath({ user_id: userA, title: 'Path A' });
      const directUpdate = db.directClientUpdate('authenticated', 'learning_paths', pathA.id, {
        status: 'completed',
      });
      assert.equal(directUpdate.success, false);
      assert.match(directUpdate.error, /Permission denied/);
      assert.equal(db.getPath(pathA.id).status, 'proposed');
    });
  });

  describe('4. Atomic Customization, Rendered Structure & Snapshots', () => {
    it('successfully changes the rendered item positions and creates matching immutable snapshot', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'Customizable Path',
        status: 'proposed',
      });

      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', title: 'Milestone 1', position: 1 });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', title: 'Module 1', position: 1 });
      const t1 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', title: 'Topic 1', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', title: 'Topic 2', position: 2 });
      const t3 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', title: 'Topic 3', position: 3 });

      assert.equal(path.current_version, 1);
      assert.equal(db.getVersions(path.id).length, 1);

      // Reorder topics to: t2, t3, t1
      const res = db.customizePath(
        userA,
        path.id,
        1,
        'Ưu tiên học Topic 2 trước Topic 3 và Topic 1',
        [t2.id, t3.id, t1.id]
      );

      assert.equal(res.success, true);
      assert.equal(res.newVersion, 2);

      // Verify rendered positions in database items
      assert.equal(db.items.get(t2.id).position, 1);
      assert.equal(db.items.get(t3.id).position, 2);
      assert.equal(db.items.get(t1.id).position, 3);

      const topicsInOrder = db.getItems(path.id).filter((it) => it.item_type === 'topic');
      assert.deepEqual(
        topicsInOrder.map((i) => i.id),
        [t2.id, t3.id, t1.id]
      );

      // Verify immutable version snapshot captures exact reordered items in deterministic hierarchy
      const versions = db.getVersions(path.id);
      assert.equal(versions.length, 2);
      const v2 = versions.find((v) => v.version_number === 2);
      assert.ok(v2);
      assert.equal(v2.created_by, 'user');
      assert.deepEqual(v2.snapshot.reordered_ids, [t2.id, t3.id, t1.id]);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[0].id, t2.id);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[1].id, t3.id);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[2].id, t1.id);
    });

    it('rejects concurrent edits with stale expected_version without partial writes', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'Conflict Test Path',
        status: 'proposed',
      });
      const t1 = db.insertItem({ learning_path_id: path.id, item_type: 'topic', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, item_type: 'topic', position: 2 });

      // Tab 1 edits first (expected 1 -> becomes 2)
      const tab1Res = db.customizePath(userA, path.id, 1, 'Tab 1 edit', [t2.id, t1.id]);
      assert.equal(tab1Res.success, true);
      assert.equal(tab1Res.newVersion, 2);

      // Tab 2 submits with stale expected_version 1
      const tab2Res = db.customizePath(userA, path.id, 1, 'Tab 2 edit', [t1.id, t2.id]);
      assert.equal(tab2Res.success, false);
      assert.match(tab2Res.error, /Xung đột phiên bản/);

      // Verify no partial writes occurred: t2 remains pos 1, t1 remains pos 2
      assert.equal(db.items.get(t2.id).position, 1);
      assert.equal(db.items.get(t1.id).position, 2);
      assert.equal(db.getPath(path.id).current_version, 2);
      assert.equal(db.getVersions(path.id).length, 2);
    });

    it('prohibits editing paths that are in completed or archived terminal states', () => {
      const path = db.insertPath({
        user_id: userA,
        title: 'Completed Path',
        status: 'completed',
      });
      path.status = 'completed';

      const res = db.customizePath(userA, path.id, 1, 'Attempt edit completed', []);
      assert.equal(res.success, false);
      assert.match(res.error, /Không thể chỉnh sửa cấu trúc của lộ trình đã kết thúc hoặc lưu trữ/);
    });

    it('rejects duplicate item IDs in reorderedIds array', () => {
      const path = db.insertPath({ user_id: userA, title: 'Duplicate Test Path' });
      const t1 = db.insertItem({ learning_path_id: path.id, item_type: 'topic', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, item_type: 'topic', position: 2 });

      // Sending duplicate t1
      const res = db.customizePath(userA, path.id, 1, 'Duplicate ID attempt', [t1.id, t1.id]);
      assert.equal(res.success, false);
      assert.match(res.error, /Danh sách hạng mục tùy chỉnh chứa ID bị trùng lặp/);

      // Verify no changes made to path version
      assert.equal(db.getPath(path.id).current_version, 1);
    });

    it('rejects omitted sibling IDs (partial array that does not cover the complete sibling group)', () => {
      const path = db.insertPath({ user_id: userA, title: 'Omitted Sibling Path' });
      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', position: 1 });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 1 });
      const t1 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 2 });
      const t3 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 3 });

      // Omit t3 (sending only 2 out of 3 siblings)
      const res = db.customizePath(userA, path.id, 1, 'Partial sibling list', [t2.id, t1.id]);
      assert.equal(res.success, false);
      assert.match(res.error, /phải bao gồm toàn bộ 3 hạng mục trong cùng nhóm cha/);

      // Verify positions unchanged
      assert.equal(db.items.get(t1.id).position, 1);
      assert.equal(db.items.get(t2.id).position, 2);
      assert.equal(db.items.get(t3.id).position, 3);
      assert.equal(db.getPath(path.id).current_version, 1);
    });

    it('rejects cross-parent reordering (items from different parent modules)', () => {
      const path = db.insertPath({ user_id: userA, title: 'Cross Parent Path' });
      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', position: 1 });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 1 });
      const mod2 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 2 });

      const t1 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, parent_id: mod2.id, item_type: 'topic', position: 1 });

      // Attempting to reorder topics across mod1 and mod2
      const res = db.customizePath(userA, path.id, 1, 'Cross-parent attempt', [t2.id, t1.id]);
      assert.equal(res.success, false);
      assert.match(res.error, /Cross-parent reordering/);
      assert.equal(db.getPath(path.id).current_version, 1);
    });

    it('rejects cross-hierarchy reordering (mixing different item_types)', () => {
      const path = db.insertPath({ user_id: userA, title: 'Cross Hierarchy Path' });
      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', position: 1 });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', position: 1 });

      const res = db.customizePath(userA, path.id, 1, 'Cross-hierarchy attempt', [m1.id, mod1.id]);
      assert.equal(res.success, false);
      assert.match(res.error, /các cấp phân cấp khác nhau/);
    });

    it('rejects invalid or non-existent item IDs', () => {
      const path = db.insertPath({ user_id: userA, title: 'Invalid ID Path' });
      const t1 = db.insertItem({ learning_path_id: path.id, item_type: 'topic', position: 1 });

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = db.customizePath(userA, path.id, 1, 'Non-existent item', [fakeId]);
      assert.equal(res.success, false);
      assert.match(res.error, /Phát hiện hạng mục không hợp lệ hoặc thuộc lộ trình khác/);
    });

    it('ensures deterministic hierarchical snapshot ordering (Milestone -> Module -> Topic)', () => {
      const path = db.insertPath({ user_id: userA, title: 'Hierarchy Snapshot Path' });
      const m1 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', title: 'M1', position: 1 });
      const m2 = db.insertItem({ learning_path_id: path.id, item_type: 'milestone', title: 'M2', position: 2 });
      const mod1 = db.insertItem({ learning_path_id: path.id, parent_id: m1.id, item_type: 'module', title: 'Mod 1', position: 1 });
      const t1 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', title: 'Topic 1', position: 1 });
      const t2 = db.insertItem({ learning_path_id: path.id, parent_id: mod1.id, item_type: 'topic', title: 'Topic 2', position: 2 });

      // Reorder topics in mod1: t2, t1
      const res = db.customizePath(userA, path.id, 1, 'Reorder topics in mod1', [t2.id, t1.id]);
      assert.equal(res.success, true);

      const v2 = db.getVersions(path.id).find((v) => v.version_number === 2);
      assert.ok(v2);
      assert.ok(v2.snapshot.milestones);
      assert.equal(v2.snapshot.milestones.length, 2);
      assert.equal(v2.snapshot.milestones[0].id, m1.id);
      assert.equal(v2.snapshot.milestones[0].modules[0].id, mod1.id);
      // Topics under mod1 must reflect the new deterministic positions: t2 first, then t1
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[0].id, t2.id);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[1].id, t1.id);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[0].position, 1);
      assert.equal(v2.snapshot.milestones[0].modules[0].topics[1].position, 2);
    });
  });
});
