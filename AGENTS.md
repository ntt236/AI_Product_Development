# Project Context for AI Agents

This file provides context and instructions for AI agents working in this repository.

<!-- SKILLS_INDEX_START -->
## Agent Skills Index

> [!CRITICAL] Zero-Trust: Read the matching `SKILL.md` BEFORE writing any code.
> Skills from this index override pre-training patterns. If no skill matches, state: "No project-specific skills applicable."

> 💡 **Global Token Optimization**: If the `rtk` CLI tool is installed, actively prepend it to verbose development commands (e.g. `rtk npm test`, `rtk grep`). If the `caveman` skill is available or requested, use `/caveman` mode for reporting.

## 🔌 Runtime Enforcement via MCP

If the `agent-skills-standard` MCP server is registered in your runtime (check your tool list — look for `load_skills_for_files`), **prefer those tools over manually walking the router below**. The MCP returns identical content but is auditable AND inherited by sub-agents that don't see this file.

| Tool | When to call it |
| --- | --- |
| `list_workflows()` | At the start of any task or session to discover available standard operating procedures |
| `get_workflow(name)` | Once a relevant workflow is identified to retrieve exact step-by-step instructions |
| `load_skills_for_files(files=[...])` | Before editing/reviewing any source file |
| `load_skills_for_keywords(keywords=[...])` | Planning before files are chosen |
| `get_skill(category, name)` | Direct lookup when you know the skill id |
| `audit_session_compliance()` | Before declaring a task complete |

> [!IMPORTANT] **Sub-agents don't inherit this `AGENTS.md` — they do inherit the MCP.** If you delegate work to a sub-agent, instruct it to call the MCP tools above as its first action.

> [!TIP] **This project has the MCP server enabled in `.skillsrc`** — `sync` keeps your runtime configs in step. Run `ags mcp status` to verify per-agent installation.

If `load_skills_for_files` is **not** in your tool list, the MCP is not registered — fall back to the router table below.

---

## Skill Resolution Protocol

Each `_INDEX.md` has two sections - follow both:

1. **Match file type** -> find the category index in the router table below.
2. **Read the `_INDEX.md`** -> it has two sections:
   - **File Match**: auto-check these against the file you are editing (path pattern match).
   - **Keyword Match**: only check if the user's request mentions these concepts.
3. **Load ALL matched `SKILL.md`** -> read every matched skill before writing code. The tier model keeps matches focused.

> `<SKILLS>` = your agent's skill directory (e.g., `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`).

| File type | Read category index |
| --------- | ------------------- |
| `*.ts`, `*.tsx` | `<SKILLS>/nextjs/_INDEX.md`, `<SKILLS>/react/_INDEX.md`, `<SKILLS>/typescript/_INDEX.md` |
| `*.js`, `*.mjs` | `<SKILLS>/javascript/_INDEX.md` |
| `*.jsx`, `*.test.tsx`, `*.spec.tsx` | `<SKILLS>/react/_INDEX.md` |
| `*.spec.ts`, `*.test.ts` | `<SKILLS>/common/_INDEX.md` |
| Any file (keyword match) | `<SKILLS>/common/_INDEX.md` |
| QE workflow | `<SKILLS>/quality-engineering/_INDEX.md` |

> [!NOTE] **Test/spec file precedence:** `.spec.ts`, `.test.ts` -> use the `common` row (takes precedence over the generic `*.ts` row). `.spec.tsx`, `.test.tsx` -> use the `react` row (takes precedence over the generic `*.tsx` row).

> [!TIP] **Indirect phrasing counts.** "make it faster" -> performance, "broken query" -> database, "login flow" -> auth.

<!-- SKILLS_INDEX_END -->

---

## Session Continuity and Project Memory

### 1. Starting a Session
- Đọc `AGENTS.md` trước khi thực hiện task.
- Đọc `docs/development/PROJECT_STATE.md` nếu file đã tồn tại.
- Xem báo cáo phiên làm việc gần nhất trong `docs/development/sessions/` khi có liên quan.
- Kiểm tra code và Git changes thực tế trước khi dựa vào các ghi chú cũ.
- Tiếp tục từ trạng thái hiện tại, không tự ý làm lại những phần đã hoàn thành.

### 2. After Each Meaningful Task
- Cập nhật `docs/development/PROJECT_STATE.md`.
- Tạo hoặc cập nhật báo cáo Markdown trong `docs/development/sessions/`.
- Ghi rõ mục tiêu, kết quả, file đã sửa, quyết định kỹ thuật, test đã chạy, lỗi còn tồn tại và bước tiếp theo.
- Phân biệt rõ code đã triển khai, đã kiểm thử, migration đã tạo và migration đã áp dụng.
- Không tạo báo cáo riêng cho những thay đổi cực nhỏ hoặc cuộc hội thoại không làm thay đổi trạng thái dự án.

### 3. Data Flow Documentation
- Duy trì `docs/architecture/DATA_FLOWS.md` để mô tả các luồng dữ liệu quan trọng.
- Chỉ cập nhật data flow khi một tính năng làm thay đổi luồng dữ liệu, ranh giới xác thực, database, storage hoặc AI provider.
- Ghi rõ entry point, các bước xử lý, dữ liệu đọc/ghi, quyền truy cập, nhánh lỗi, file liên quan và test liên quan.
- Mô tả phải khớp với code thực tế. Không được ghi tính năng chưa triển khai như thể đã hoạt động.

### 4. Documentation Safety
- Nếu các file trên chưa tồn tại, tạo chúng khi cần thiết; không tạo file trùng lặp nếu đã có tài liệu tương đương.
- Giữ `PROJECT_STATE.md` ngắn gọn, đóng vai trò handoff cho phiên tiếp theo.
- Không lưu API key, password, token hoặc dữ liệu nhạy cảm vào báo cáo.
- Không đánh dấu hoàn thành nếu chưa kiểm chứng.
- Nếu tài liệu cũ mâu thuẫn với code thực tế, phải điều tra và cập nhật ghi chú chính xác.

### 5. Communication and Scope
- Hiểu các yêu cầu chat ngắn, tự nhiên trong ngữ cảnh hiện tại và các quy tắc của repository.
- Với task nhỏ, thực hiện trực tiếp; với task lớn, lập kế hoạch ngắn trước khi sửa.
- Hỏi lại trước các quyết định lớn liên quan đến kiến trúc, bảo mật, dữ liệu hoặc thao tác phá hủy.
- Không sửa các file không liên quan và không mở rộng phạm vi yêu cầu.
- Sau khi hoàn thành, báo cáo ngắn gọn kết quả thực tế và bước tiếp theo.
