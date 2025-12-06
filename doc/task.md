# 고도화 기능 개발 작업 목록 (Task List)

## 1. 게스트 모드 (Guest Mode)
- [x] **UI/UX 구현**
    - [x] `Welcome.tsx`: [체험하기] 버튼 추가 및 클릭 이벤트 핸들러 구현
    - [x] `App.tsx`: 게스트 로그인 처리 (`GameSession` 생성 시 `isGuest: true`, `nickname: '게스트#...'`)
- [x] **게임 종료 프로세스 개선**
    - [x] `GameOverModal.tsx`: 게스트일 경우 "가상 랭킹" 및 "회원가입 유도" UI 표시
    - [x] `useGameScore.ts`: 게스트 점수 제출 시 로컬 상태(`isScoreSubmitSuccess`)만 업데이트하도록 수정 (이미 3단계 리팩토링에서 반영됨, 확인 필요)
- [x] **가입 연동**
    - [x] `GameOverModal.tsx`: [회원가입] 버튼 클릭 시 `AuthModal` 호출
    - [x] `AuthModal` (또는 상위): 가입 성공 시 `onSignUpSuccess` 콜백에서 임시 저장된 게스트 점수를 DB에 제출하는 로직 구현

## 2. 드롭 시스템 (Drop System)
- [x] **DB 스키마 변경**
    - [x] Supabase `profiles` 테이블에 `drop_point` (float/numeric) 컬럼 추가 (SQL 마이그레이션)
- [x] **로직 구현**
    - [x] `src/domains/game/scoring.ts`: 점수 기반 드롭 계산 로직 확인 (`calculateMileage` -> `calculateDrop` 리네이밍 고려)
    - [x] `src/lib/queries.ts`: 게임 종료 시 `drop_point` 업데이트 RPC 또는 쿼리 추가
- [x] **UI 표시**
    - [x] `GameOverModal.tsx`: 획득한 드롭 표시 (예: +12.5 DR)
    - [x] `RankingBoard.tsx` / `Welcome.tsx`: 내 프로필 영역에 누적 드롭 표시

## 3. 신규 바이러스 3종 (New Viruses)
- [x] **공통 작업**
    - [x] `src/domains/types.ts`: `VirusType`에 `math`, `bomb`, `landmine-field` 추가
    - [x] `src/domains/game/virus.ts`: 각 바이러스별 지속시간, 이름 등 메타데이터 정의
- [x] **A. 정승제 바이러스 (수학)**
    - [x] `src/domains/game/words.ts`: `spawnWords`에서 수학 문제 생성 로직 추가 (`Word` 타입에 `mathAnswer` 등 추가 필요)
    - [x] `GameScreen.tsx`: 수학 문제 단어 렌더링 (수식 표시)
    - [x] `gameStore.ts`: 정답 입력 시 점수 계산 로직 (`정답 * 100`) 추가 및 플로팅 효과 구현
- [x] **B. 시한폭탄 바이러스 (타임어택)**
    - [x] `src/domains/game/words.ts`: 폭탄 단어 생성 시 `timer` 속성 초기화 (5초)
    - [x] `useGameTimer.ts`: 폭탄 단어 타이머 감소 로직 추가 (0초 도달 시 생명력 감소)
    - [x] `GameScreen.tsx`: 단어 옆에 타이머 UI 표시 (노란색, 24px)
- [x] **C. 지뢰밭 바이러스 (광역)**
    - [x] `gameStore.ts`: `activateVirus`에서 `landmine-field` 발동 시 `wordList` 전체를 순회하며 타입을 `landmine`으로 변경
    - [x] `src/domains/game/words.ts`: 지뢰 단어는 스테이지가 바뀌어도 사라지지 않도록 `resetWords` 로직 예외 처리 (또는 별도 관리)

## 4. 내 단어 등록 (User Submitted Words)
- [ ] **DB 스키마 설계**
    - [ ] `word_submissions` 테이블 생성 (id, user_id, word, status, reject_reason, use_count, created_at)
- [ ] **사용자 기능 (등록/조회)**
    - [ ] `src/components/WordSubmissionModal.tsx`: 단어 등록 폼 구현
    - [ ] `src/components/MyWordsModal.tsx`: 내 단어 목록 및 상태(승인/반려) 조회 UI
    - [ ] `src/lib/queries.ts`: 단어 등록/조회 API 추가
- [ ] **관리자 기능 (Admin)**
    - [ ] `src/admin/pages/WordManagePage.tsx`: 전체 단어 목록 조회 및 필터링(미승인/승인/반려) UI
    - [ ] `src/admin/pages/WordManagePage.tsx`: 체크박스 다중 선택 및 일괄 승인 기능 구현
    - [ ] `src/admin/pages/WordManagePage.tsx`: 반려 사유 입력 모달 및 처리 로직
- [ ] **게임 연동**
    - [ ] `src/domains/game/wordService.ts`: `getWordsForStage`에서 공식 단어와 승인된 유저 단어를 혼합하여 가져오도록 쿼리 수정
