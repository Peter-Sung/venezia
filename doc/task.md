# Venezia Typing Game — 최종 개발 체크리스트 & 프롬프트 매핑

> 각 Task마다 실행해야 할 **Prompt Package 블록**을 직관적으로 연결했으며,  
> 원문 Prompt 세부 내용은 `prompts_en.md` / `prompts_kr.md`에서 전체 확인 가능

---

## 🛠 제안 기술 스택
- **Frontend:** React + Vite (빠른 빌드 & 컴포넌트화)
- **Game Rendering:** Game Logic & Animation: React State + CSS Transitions/Animations (DOM 기반)
- **State Management:** Zustand (간결한 전역상태)
- **Styling:** CSS Modules or Styled-components (윈도우 3.1 UI 구현)
- **Backend/DB:** Supabase (Postgres + Auth + Realtime)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Vercel or Netlify

---

## 🚀 개발 단계 (총 6단계)

---

### **Step 1. 프로젝트 기반 세팅 (M0)**
🎯 **목표:** 개발환경 세팅과 최소 실행 화면 준비

- [O] Vite + React + TS 초기 세팅  
  👉 Prompt: **One-Shot Bootstrap**  
  요약: Vite+React+TS 프로젝트 생성, Pixi/Zustand/TanStack 설치, 기본 폴더 구조 세팅

- [O] ESLint/Prettier + Vitest 환경 설정  
  👉 Prompt: **One-Shot Bootstrap (Acceptance)**  
  요약: ESLint/Prettier/Vitest/Playwright 기본 설정 및 샘플 테스트

- [O] Zustand 기본 store 생성  
  👉 Prompt: **One-Shot Bootstrap (Store)**  
  요약: 점수/단계/남은 블록/단어 리스트를 관리하는 전역 store 생성

- [O] Retro 스타일 토큰(CSS 변수) 정의  
  👉 Prompt: **UI Flow & Retro Styling (tokens.css)**  
  요약: Windows 3.1 스타일 색상/폰트/베벨 효과 토큰 정의

- [O] Supabase 프로젝트 연결 (`.env` 분리)  
  👉 Prompt: **Supabase Read (client)**  
  요약: Supabase SDK 초기화 및 환경변수 적용

---

### **Step 2. 코어 게임 루프 구현 (M1)**
🎯 **목표:** 단어 낙하 및 블록 충돌/게임오버 로직 완성

- [O] 게임 영역(DOM) 설정 및 render loop 구축  
  👉 Prompt: **Core Loop**  
  요약: CSS Grid/Flexbox 기반 12개 컬럼, 단어 컴포넌트, requestAnimationFrame 기반 애니메이션 루프

- [O] 단어(DOM 요소) 생성 및 낙하 애니메이션 구현  
  👉 Prompt: **Core Loop (Spawn/Move)**  
  요약: 단계별 출현 속도에 맞춰 단어 생성, CSS transform과 transition 또는 @keyframes으로 하강 효과 구현

- [O] 컬럼 하단 충돌 감지 및 블록 파괴 로직 구현  
  👉 Prompt: **Core Loop (Collision)**  
  요약: DOM 요소 위치(getBoundingClientRect)나 상태(state) 기반으로 바닥 충돌 감지, 충돌 시 해당 컬럼 블록 감소, 모든 블록 소멸 시 게임오버

- [O] 사용자 입력창 구현 (기본 로직)  
  👉 Prompt: **IME-Safe Input (Skeleton)**  
  요약: 숨김 input + composition 이벤트 처리

- [O] 입력과 단어 매칭 → 일치 시 제거/점수 획득  
  👉 Prompt: **Core Loop + IME-Safe Input**  
  요약: prefix 매칭 → 완전 일치 시 단어 컴포넌트 제거 + 점수 부여

- [O] 블록 모두 파괴 시 게임 오버 처리  
  👉 Prompt: **Core Loop (Game Over)**  
  요약: 12블록 소멸 → React로 GameOver 이벤트 전달

---

### **Step 3. UI & 사용자 플로우 연결 (M2)**
🎯 **목표:** 시작-게임-종료 UX 플로우 완성

- [O] 웰컴 화면 (닉네임 입력/저장, 시작 버튼)  
  👉 Prompt: **UI Flow & Retro Styling (Welcome)**  
  요약: 닉네임 입력창(LocalStorage 저장), 시작/랭킹 버튼

- [O] 상태 바 UI (단계, 점수, 블록, 시간 표시)  
  👉 Prompt: **UI Flow & Retro Styling (HUD)**  
  요약: 점수/단계/시간을 HUD로 표시

- [O] Game Over 모달 기본 UI  
  👉 Prompt: **UI Flow & Retro Styling (Game Over Modal)**  
  요약: “Retry/Back to Main” 버튼 포함 모달

- [O] “다시하기 / 메인으로” 버튼 동작 연결  
  👉 Prompt: **UI Flow & Retro Styling (Modal Actions)**  
  요약: 버튼 이벤트로 라우팅 처리

- [O] LocalStorage 기반 닉네임 저장  
  👉 Prompt: **UI Flow & Retro Styling (Nickname)**  
  요약: 입력한 닉네임을 LocalStorage에 보존

---

### **Step 4. 게임 시스템 고도화 (M3)**
🎯 **목표:** PRD 규칙 반영한 점수·단계 시스템 완성

- [O] 점수 공식 적용 (1차): `(단어 길이 * 단계 * 10)`을 우선 적용  
  👉 Prompt: **Core Loop (Scoring)**  
  요약: 단어 길이 기반으로 1차 점수 공식 적용

- [O] 총 플레이 시간 (MM:SS.s) 측정  
  👉 Prompt: **Tests & Perf (Stopwatch)**  
  요약: 게임 진행 시간 추적 유틸

- [O] 단계별 클리어 조건(60초 생존) 적용  
  👉 Prompt: **Core Loop (Stage Clear)**  
  요약: 일정 시간 생존 시 단계 클리어

- [O] 단계 전환 모달(3초 카운트다운) 표시  
  👉 Prompt: **UI Flow & Retro Styling (Stage Clear Modal)**  
  요약: 3초 카운트다운 모달 표시

- [O] 다음 단계 시작 시 블록 유지  
  👉 Prompt: **Core Loop (Stage Progression)**  
  요약: 블록 상태 유지하고 다음 단계 시작

- [O] DB에서 난이도별 단어 목록 불러오기  
  👉 Prompt: **Core Loop (Wordgen from DB)**  
  요약: Supabase DB에서 현재 레벨에 맞는 단어를 fetch하여 생성

---

### **Step 5. Supabase 연동 (M4)**
🎯 **목표:** 서버 연동 및 온라인 랭킹

- [O] Supabase DB 테이블 생성 (`scores`, `stage_settings`, `words`)
  👉 Prompt: **Supabase Read (SQL)**  
  요약: scores, stage_settings, words 테이블 생성 SQL

- [O] `stage_settings` 불러와 낙하 속도/출현 속도/클리어 시간 적용  
  👉 Prompt: **Supabase Read (Queries)**  
  요약: 단계별 속도(하강, 출현)/시간 Supabase에서 불러오기

- [O] 게임 종료 → `update_high_score` RPC 호출  
  👉 Prompt: **Supabase RPC Write**  
  요약: 닉네임별 최고 점수만 갱신하는 RPC 호출

- [O] 웰컴/게임오버 모달에서 Top10 + 내 기록 조회  
  👉 Prompt: **Supabase Read (Rankings Modal)**  
  요약: Top10 랭킹 및 내 기록 조회 UI

- [O] 내 기록 하이라이트 / Top10 외면 구분선 아래 표시  
  👉 Prompt: **Supabase RPC Write (UI Rule)**  
  요약: Top10 내 기록은 강조, 외부는 구분선 아래 표시

---

### **Step 6. 리팩토링 & 배포 (M5)**
🎯 **목표:** 코드 품질 개선 + 배포

- [O] 관리자 페이지 기능 구현
  👉 Prompt: **Admin Page**
  요약: /admin 경로, 암호 인증, stage_settings 값 수정 기능 구현

- [O] 점수 계산 고도화: 글자 수 기반에서 실제 타수 기반(한/영, 특수문자 포함)으로 변경  
  👉 Prompt: **Refactor Pass (Scoring)**  
  요약: 점수 계산 로직을 실제 타수 기반으로 정교화

- [O] 중복 로직/컴포넌트 분리 (Custom Hooks 등)  
  👉 Prompt: **Refactor Pass**  
  요약: 재사용 훅/컴포넌트 분리, 상태 구조 개선

- [ ] Zustand 상태 구조 최적화  
  👉 Prompt: **Refactor Pass (Store)**  
  요약: store 평탄화 및 타입 개선

- [O] Windows 3.1 스타일 가이드 맞춰 UI 다듬기  
  👉 Prompt: **Refactor Pass + UI Flow**  
  요약: UI/스타일 최종 정리

- [ ] 크로스 브라우저 테스트(Chrome/Safari/Edge)  
  👉 Prompt: **Tests & Perf (Cross-browser)**  
  요약: 브라우저 호환성 확인

- [O] 최종 버그 픽스  
  👉 Prompt: **Bug-Hunt & Hardening**  
  요약: IME edge case, 치팅 방지 테스트 강화

- [ ] Vercel/Netlify 배포  
  👉 Prompt: **Deploy Prompt Pack**  
  요약: vercel.json/netlify.toml 설정 + README 배포 가이드


---

### **Step 7. 바이러스 효과 적용 (M6)**
🎯 **목표:** 8종의 바이러스 효과를 시스템에 구현하여 게임의 다이나믹스를 추가합니다.

- [O] **Phase 1: 바이러스 시스템 기반 구축**  
  요약: 특별 단어(노란색) 출현, 바이러스 8종 중 1종 랜덤 발동, 바이러스 상태(종류, 지속시간) 및 UI 표시기 등 모든 바이러스의 공통 뼈대 구현.

- [O] **Phase 2: 즉시 발동형 바이러스 구현**  
  요약: 가장 단순한 효과의 바이러스(재건, 싹쓸이, 패거리)를 구현하여 기반 시스템을 검증. 재건은 블록 12개로, 싹쓸이는 모든 단어 제거, 패거리는 단어 5개 추가 생성.

- [O] **Phase 3: 시간 기반 능력치 변경 바이러스 구현**  
  요약: 일정 시간 동안 게임 파라미터를 변경하는 바이러스(마취, 굼벵이, 날쌘) 구현. 각각 단어 멈춤, 하강 속도 조절 기능.

- [O] **Phase 4: 복잡한 시각/논리 바이러스 구현**  
  요약: 복잡한 렌더링/로직이 필요한 바이러스(숨바꼭질, 지뢰) 구현. 숨바꼭질은 단어를 '????'로, 지뢰는 새로운 충돌 감지 로직 추가.


---

## 🔄 코드 리팩토링 시점
- 소규모 리팩토링: Step 2~5 중 발견 즉시 처리
- 대규모 리팩토링: Step 6에서 구조/스타일 정리

---

## 📌 추가 제안 (바이브코딩 최적화)
- 각 Task 실행 시 Gemini CLI에 `prd.md + task.md + design.md`를 항상 context로 제공하세요.
- Task마다 매핑된 Prompt 블록 이름 옆 요약 설명을 보고, 세부 내용이 필요하면 `prompts_en.md` / `prompts_kr.md`에서 전문 확인하세요.