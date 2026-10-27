/**
 * TOEIC Scaled Score Conversion Table (Reference: ETS Standard Scale)
 * Version: toeic_v1
 * 
 * Scaled Score Bounds:
 * - Listening: 5 to 495 (increments of 5)
 * - Reading: 5 to 495 (increments of 5)
 * - Total Score: 10 to 990 (increments of 5)
 */

export const TOEIC_SCORING_VERSION = 'toeic_v1';

export const TOEIC_LEGAL_DISCLAIMER =
  'Kết quả này là điểm số ước tính dựa trên thang quy đổi đối chiếu chuẩn ETS (10–990). Điểm số này nhằm mục đích tự đánh giá và định hướng học tập nội bộ trên EngRise, không thay thế chứng chỉ TOEIC® chính thức do ETS hoặc đơn vị ủy quyền cấp.';

// Map raw score (0-100) to estimated scaled score (5-495)
// Based on standard ETS test equating reference charts.
const LISTENING_SCORE_MAP: Record<number, number> = {
  0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5,
  7: 10, 8: 15, 9: 20, 10: 25, 11: 30, 12: 35, 13: 40, 14: 45, 15: 50,
  16: 55, 17: 60, 18: 65, 19: 70, 20: 75, 21: 80, 22: 85, 23: 90, 24: 95, 25: 100,
  26: 105, 27: 110, 28: 115, 29: 120, 30: 125, 31: 130, 32: 135, 33: 140, 34: 145, 35: 150,
  36: 155, 37: 160, 38: 165, 39: 170, 40: 175, 41: 180, 42: 185, 43: 195, 44: 200, 45: 205,
  46: 210, 47: 215, 48: 220, 49: 225, 50: 235, 51: 240, 52: 245, 53: 250, 54: 255, 55: 260,
  56: 270, 57: 275, 58: 280, 59: 285, 60: 290, 61: 295, 62: 300, 63: 305, 64: 310, 65: 315,
  66: 320, 67: 325, 68: 330, 69: 335, 70: 340, 71: 345, 72: 350, 73: 355, 74: 360, 75: 370,
  76: 375, 77: 380, 78: 385, 79: 390, 80: 395, 81: 400, 82: 405, 83: 410, 84: 415, 85: 425,
  86: 430, 87: 435, 88: 440, 89: 445, 90: 450, 91: 455, 92: 465, 93: 470, 94: 480, 95: 485,
  96: 490, 97: 495, 98: 495, 99: 495, 100: 495
};

const READING_SCORE_MAP: Record<number, number> = {
  0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5,
  10: 10, 11: 15, 12: 20, 13: 25, 14: 30, 15: 35, 16: 40, 17: 45, 18: 50, 19: 55,
  20: 60, 21: 65, 22: 70, 23: 75, 24: 80, 25: 85, 26: 90, 27: 95, 28: 100, 29: 105,
  30: 110, 31: 115, 32: 120, 33: 125, 34: 130, 35: 135, 36: 140, 37: 145, 38: 150, 39: 155,
  40: 160, 41: 165, 42: 170, 43: 175, 44: 180, 45: 185, 46: 190, 47: 195, 48: 200, 49: 205,
  50: 215, 51: 220, 52: 225, 53: 230, 54: 235, 55: 240, 56: 245, 57: 250, 58: 255, 59: 260,
  60: 265, 61: 270, 62: 275, 63: 280, 64: 285, 65: 290, 66: 300, 67: 305, 68: 310, 69: 315,
  70: 320, 71: 325, 72: 330, 73: 335, 74: 340, 75: 345, 76: 350, 77: 355, 78: 360, 79: 365,
  80: 370, 81: 375, 82: 380, 83: 385, 84: 390, 85: 400, 86: 405, 87: 410, 88: 415, 89: 420,
  90: 425, 91: 435, 92: 440, 93: 450, 94: 455, 95: 465, 96: 475, 97: 485, 98: 490, 99: 495, 100: 495
};

/**
 * Converts Listening raw score (0-100) to Scaled Score (5-495).
 * Clamps safely within [5, 495].
 */
export function convertListeningRawToScaled(rawScore: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(rawScore)));
  return LISTENING_SCORE_MAP[clamped] ?? 5;
}

/**
 * Converts Reading raw score (0-100) to Scaled Score (5-495).
 * Clamps safely within [5, 495].
 */
export function convertReadingRawToScaled(rawScore: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(rawScore)));
  return READING_SCORE_MAP[clamped] ?? 5;
}

/**
 * Calculates complete TOEIC estimated score from raw counts.
 * In mini tests or part practice with fewer than 100 questions per section,
 * raw score is normalized proportionally to a 100-question base before conversion.
 */
export function calculateToeicScaledScores(params: {
  listeningCorrect: number;
  listeningTotal: number;
  readingCorrect: number;
  readingTotal: number;
}): {
  listeningRawScore: number;
  readingRawScore: number;
  estimatedListeningScore: number;
  estimatedReadingScore: number;
  estimatedTotalScore: number;
  scoringVersion: string;
  disclaimer: string;
} {
  const { listeningCorrect, listeningTotal, readingCorrect, readingTotal } = params;

  // Normalized raw score on 100-question scale
  const listeningRaw = listeningTotal > 0
    ? Math.round((listeningCorrect / listeningTotal) * 100)
    : 0;

  const readingRaw = readingTotal > 0
    ? Math.round((readingCorrect / readingTotal) * 100)
    : 0;

  const estimatedListeningScore = convertListeningRawToScaled(listeningRaw);
  const estimatedReadingScore = convertReadingRawToScaled(readingRaw);
  const estimatedTotalScore = estimatedListeningScore + estimatedReadingScore;

  return {
    listeningRawScore: listeningRaw,
    readingRawScore: readingRaw,
    estimatedListeningScore,
    estimatedReadingScore,
    estimatedTotalScore,
    scoringVersion: TOEIC_SCORING_VERSION,
    disclaimer: TOEIC_LEGAL_DISCLAIMER
  };
}
