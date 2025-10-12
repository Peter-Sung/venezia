
/**
 * 입력된 문자열의 실제 키보드 타수를 계산합니다.
 * 한글(자모 분리, 복모음, 된소리), 영어(대소문자)를 모두 고려합니다.
 */
export const calculateKeystrokes = (word: string): number => {
  let count = 0;
  
  // 한글 자모 분리를 위한 초성, 중성, 종성 배열
  const CHO = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  const JUNG = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
  ];
  const JONG = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 
    'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  // 복모음/복자음 타수 계산을 위한 맵
  const complexJamoMap: Record<string, number> = {
    // 모음
    'ㅘ': 2, 'ㅙ': 3, 'ㅚ': 2, 'ㅝ': 2, 'ㅞ': 3, 'ㅟ': 2, 'ㅢ': 2,
    // 자음
    'ㄲ': 2, 'ㄸ': 2, 'ㅃ': 2, 'ㅆ': 2, 'ㅉ': 2,
    'ㄳ': 2, 'ㄵ': 2, 'ㄶ': 2, 'ㄺ': 2, 'ㄻ': 2, 'ㄼ': 2, 
    'ㄽ': 2, 'ㄾ': 2, 'ㄿ': 2, 'ㅀ': 2, 'ㅄ': 2
  };

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const charCode = char.charCodeAt(0);

    // 1. 한글 처리
    if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
      const unicode = charCode - 0xAC00;
      const choIndex = Math.floor(unicode / (21 * 28));
      const jungIndex = Math.floor((unicode % (21 * 28)) / 28);
      const jongIndex = unicode % 28;

      const cho = CHO[choIndex];
      const jung = JUNG[jungIndex];
      const jong = JONG[jongIndex];

      count += complexJamoMap[cho] || 1;
      count += complexJamoMap[jung] || 1;
      if (jong) {
        count += complexJamoMap[jong] || 1;
      }
    }
    // 2. 영어 및 기타 문자 처리
    else {
      // 대문자 또는 Shift가 필요한 특수문자
      if (
        (char >= 'A' && char <= 'Z') ||
        ['?', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '~'].includes(char)
      ) {
        count += 2;
      } 
      // 소문자, 숫자, 기본 특수문자
      else {
        count += 1;
      }
    }
  }

  return count;
};
