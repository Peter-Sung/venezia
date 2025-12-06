// 바이러스 타입 정의
export const VIRUS_TYPES = [
  'annihilator', 'stun', 'reconstruction', 'swift', 'sloth',
  'hide-and-seek', 'gang', 'landmine', 'math', 'bomb', 'landmine-field'
] as const;
export type VirusType = typeof VIRUS_TYPES[number];


// 단어의 타입을 정의합니다.
export interface Word {
  id: number;
  text: string;
  x: number; // 0-11 사이의 컬럼 인덱스
  y: number; // 화면 상단으로부터의 Y 좌표 (px)
  isSpecial?: boolean; // 바이러스 발동을 위한 특별 단어 여부
  isHidden?: boolean; // 숨바꼭질 바이러스에 의해 숨김 처리되었는지 여부
  mathAnswer?: number; // 정승제 바이러스: 수학 문제 정답
  timer?: number; // 시한폭탄 바이러스: 남은 시간 (ms)
  maxTimer?: number; // 시한폭탄 바이러스: 초기 시간 (ms)
}

// 지뢰의 타입을 정의합니다.
export interface Landmine {
  id: number;
  x: number; // 0-11 사이의 컬럼 인덱스
  y: number; // 화면 상단으로부터의 Y 좌표 (px)
}
