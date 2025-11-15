# Gemini Runbook: Venezia Typing Game (v2 - Code-Verified)

이 문서는 Gemini AI가 'Venezia' 프로젝트의 컨텍스트를 신속하게 파악하고, **실제 코드베이스에 기반하여** 일관성 있는 개발을 수행하기 위한 최신 지침서입니다. 기존 문서는 현재 구현과 차이가 있어, 코드 분석을 통해 정보를 검증하고 갱신했습니다.

## 1. 🎯 프로젝트 개요 (Overview)

- **프로젝트명**: Venezia
- **목표**: 90년대 '한메타자교사'의 '베네치아' 게임을 현대 웹 기술로 복각. 윈도우 3.1 스타일의 레트로 UI와 온라인 랭킹 시스템을 통해 추억과 경쟁의 재미를 제공하는 PC 웹 기반 타자 연습 게임.
- **핵심 플레이**: 하늘에서 떨어지는 단어를 입력하여 제거하고, 단어가 바닥에 닿아 기회 블록 12개가 모두 파괴되기 전에 최대한 오래 생존하며 높은 점수를 획득하는 것이 목표.

## 2. 🛠️ 기술 스택 (Tech Stack)

- **프레임워크**: React 18, Vite
- **언어**: TypeScript
- **상태 관리**: Zustand (클라이언트 전역 상태), TanStack Query (서버 상태)
- **백엔드 & DB**: Supabase (PostgreSQL, Edge Functions, RLS)
- **스타일링**: CSS Modules, `tokens.css` (디자인 토큰 기반)
- **테스트**: Vitest (유닛/컴포넌트), Playwright (E2E)
- **핵심 로직**:
  - 렌더링/애니메이션: React DOM + CSS Transitions/Animations
  - 한글 입력: Composition Events API

## 3. 📂 프로젝트 구조 (Project Structure)

- `src/`: 메인 소스 코드
  - `admin/`: 관리자 페이지 관련 컴포넌트 및 로직 (`AdminLogin.tsx`, `ManageWords.tsx` 등)
  - `components/`: 게임 화면(`GameScreen.tsx`), 모달(`GameOverModal.tsx`) 등 주요 UI 컴포넌트
  - `hooks/`: `useGameLogic`, `useWordManager` 등 게임의 핵심 로직을 담은 커스텀 훅
  - `lib/`: Supabase 클라이언트(`supabaseClient.ts`) 및 API 호출 함수(`queries.ts`)
  - `domains/`: `ime.ts` 등 특정 도메인 관련 순수 함수
- `supabase/`: Supabase 백엔드 로직
  - `functions/`: **인증 및 핵심 비즈니스 로직을 처리하는 Edge Functions** (`login-player`, `register-player`, `update-stage-settings` 등)
- `query/`: DB 스키마 및 RPC 정의 SQL 파일. **(DB 구조의 사실상 표준)**

## 4. ⚙️ 핵심 로직 및 설계 (Core Logic & Design)

### 4.1. 인증 시스템 (Authentication - Implemented)

- **방식**: 단순 닉네임이 아닌, **닉네임과 비밀번호 기반의 자체 인증 시스템**을 사용합니다.
- **테이블**: `players` 테이블에 사용자 정보(`nickname`, `hashed_password`)를 저장합니다.
- **서버 로직**:
  - `supabase/functions/register-player`: 사용자 회원가입 처리.
  - `supabase/functions/login-player`: 사용자 로그인 처리 및 JWT 발급.
- **흐름**: 사용자는 웰컴 페이지에서 닉네임으로 플레이하거나, 회원가입/로그인을 통해 자신의 기록을 관리할 수 있습니다.

### 4.2. 게임 메커니즘

- **단어 관리 (`useWordManager.ts`)**:
  -   `words` 테이블에서 현재 레벨(`min_level`, `max_level`)에 맞는 단어를 Fetch.
  -   `stage_settings`의 `spawn_interval_seconds`에 맞춰 주기적으로 새 단어 생성.
- **게임 로직 (`useGameLogic.ts`)**:
  -   사용자 입력 처리, 단어 매칭, 점수 계산, 상태 업데이트 등 게임의 모든 규칙 관장.
  -   단어가 바닥에 닿으면(`onAnimationEnd` 이벤트) 해당 컬럼의 기회 블록 파괴.
- **타이머 (`useGameTimers.ts`)**:
  -   총 플레이 시간, 단계 클리어 시간 등 게임 내 모든 시간 관련 로직 처리.

### 4.3. 디자인 시스템 (Design System)

- **참조**: `doc/design.md`, `src/tokens.css`
- **핵심**: Windows 3.1 스타일의 레트로 디자인.
  -   **색상**: `--color-primary-blue-deep` (`#0000A8`), `--color-neutral-gray-medium` (`#C6C6C6`) 등.
  -   **타이포그래피**: "Neo둥근모" 픽셀 폰트, 앤티 앨리어싱 없음.
  -   **효과**: `border`를 이용한 입체적인 버튼 효과 (`bevel-outset`, `bevel-inset`).

## 5. 💾 백엔드 (Supabase)

### 5.1. 데이터 모델 (Code-Verified)

- **`players`**: 사용자 계정 정보.
  - `id`, `nickname` (unique), `hashed_password`, `created_at`
- **`scores`**: 사용자별 최고 점수. (`players` 테이블과 관계 설정됨)
  - `id`, `player_id` (fk to `players.id`), `score`, `play_at`, `updated_at`
- **`stage_settings`**: 단계별 난이도 설정.
  - `stage_level` (pk), `fall_duration_seconds`, `spawn_interval_seconds`, `clear_duration_seconds`
- **`words`**: 게임에 등장하는 단어 목록.
  - `id` (pk), `text`, `min_level`, `max_level`

### 5.2. 핵심 API (Edge Functions & RPC)

- **Edge Functions**:
  - `register-player`: 사용자 등록.
  - `login-player`: 사용자 로그인.
  - `update-stage-settings`: 관리자 페이지에서 게임 난이도 수정.
  - `verify-admin-password`: 관리자 페이지 접근 인증.
- **RPC**:
  - `update_high_score`: 게임 종료 시 최고 점수 갱신.
  - `get_words_paginated`, `add_words`, `update_word_levels`, `delete_word`: 관리자 페이지의 단어 관리 기능.

## 6. 🔑 관리자 페이지 (Admin Page)

- **경로**: `/admin`
- **기능**:
  - 암호 인증 후 접근 (`/admin/login`).
  - **단어 관리**: `words` 테이블의 단어를 추가, 수정, 삭제. (e.g., `ManageWords.tsx`)
  - **게임 설정 수정**: `stage_settings`의 단계별 하강 시간, 출현 속도 등을 수정. (e.g., `EditFallDuration.tsx`)

## 7. 🚀 개발 및 테스트 (Dev & Test)

- **실행**: `pnpm dev`
- **유닛 테스트**: `pnpm test`
- **E2E 테스트**: `pnpm exec playwright test`

## 8. ✨ 향후 확장 계획 (Verified)

- **바이러스 시스템**: '싹쓸이', '마취', '재건' 등 게임 플레이에 변수를 주는 9가지 바이러스 효과 구현. (코드베이스에서 관련 구현이 아직 확인되지 않음)
- **랭킹 보드 고도화**: 주간/월간 랭킹, 친구 랭킹 등 추가.
