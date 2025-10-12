# gemini.md — Vibe Coding Runbook for Venezia

## 0) Scope & Ground Rules
- Context로 항상 로드: `prd.md`, `task.md`, `design.md`, `tokens.css`
- IME 처리 원칙: keydown 비교 금지, composition 이벤트 후 완성 음절(NFC) 기준 비교
- 보안 원칙: Supabase RLS + `update_high_score` RPC만 쓰기 허용

## 1) Project Quick Facts
- Stack: React+Vite+TS, DOM/CSS Animations, Zustand, Supabase, Vitest, Playwright
- App Paths: `src/app`, `src/game`, `src/design-tokens/tokens.css`
- Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## 2) Commands (Cheat Sheet)
- Dev: `pnpm dev`
- Unit: `pnpm test`
- E2E: `pnpm exec playwright test`
- Build: `pnpm build`
- Preview: `pnpm preview`

## 3) Prompt Usage Guide
- 각 작업은 `task.md`에서 Task 확인 → 해당 Prompt 이름 찾기 → `prompts_en.md` 또는 `prompts_kr.md`에서 전문 복사 실행
- 순서: One-Shot Bootstrap → Core Loop → IME-Safe Input → UI → Supabase(Read/RPC) → Tests/Perf → Refactor → Deploy

## 4) Refactor Pass (Dedicated Prompts)
**EN**
```
Refactor the codebase:
- Extract reusable hooks/components (useStopwatch, RetroButton, RetroModal)
- Flatten Zustand store; add action slices & strict TS types
- Separate game logic (e.g., word spawning, collision) into pure functions or custom hooks, independent of rendering
- Remove any keydown-based matching; composition-only path
- Summarize changes as before/after
```

**KR**
```
리팩토링 목표:
- 재사용 훅/컴포넌트 분리(useStopwatch, RetroButton, RetroModal)
- Zustand 평탄화 + 타입 엄격화
- 게임 로직(단어 생성, 충돌 감지 등)을 렌더링과 무관한 순수 함수 또는 커스텀 훅으로 분리
- keydown 비교 제거(composition 기반만 유지)
- 변경 요약을 주석으로 남길 것
```

## 5) Supabase Migration Playbook
- 순서: `001_stage_settings.sql` → `002_scores.sql` → `003_rpc_update_high_score.sql`
- 적용: 대시보드 또는 CLI로 파일 순차 실행
- 롤백: 변경 전 스냅샷/백업 필수. RPC 수정 시 재배포 전 테스트
- 체크: RLS 정책이 **직접 insert/update 차단**하는지 확인

## 6) CI/CD & Hosting (GitHub → Vercel/Netlify)
- **환경변수**: Vercel/Netlify Dashboard에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 등록 (로컬 .env는 커밋 금지)
- **SPA 라우팅**:
  - Vercel: `vercel.json`에서 `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`
  - Netlify: `netlify.toml`에 `/*    /index.html   200`
- **Node/Playwright 버전**: CI 버전 고정 (node 20.x 권장), E2E는 `pnpm exec playwright install --with-deps`
- **Vite base**: 저장소 서브경로 호스팅 시 `vite.config.ts`의 `base` 확인

## 7) Deployment Checklist
- [ ] Unit/E2E 통과
- [ ] tokens.css 정상 로드 및 레트로 룩 검증
- [ ] Supabase `stage_settings`/`scores` 존재, RPC 호출 성공
- [ ] Ranking 모달: Top10/내 기록 표기 규칙 PRD와 일치
- [ ] .env/대시보드 환경변수 설정 확인(프로덕션/프리뷰 분리)

## 8) Observability & QA
- Dev 로깅: 스폰/제거/점수/단계 전환을 `console.info`로 태깅
- IME 테스트 매트릭스: 한글 조합/영문 혼입/붙여넣기
- 성능 목표: 60 FPS, 객체 풀링 & batched updates

## 9) Known Pitfalls & Fixes
- 배포 후 빈 페이지: **SPA 리라이트 누락** (위 6번 참고)
- Supabase 401/403: anon 키/URL 오타, RLS 정책 과도 차단 여부 점검
- 한글 입력 오작동: keydown 비교 코드 잔존 여부 검색 후 제거

## 10) Ownership & Development Process
- **단계별 확인**: 각 개발 단계(Step) 완료 시, 변경 사항을 확인할 수 있는 **접속 주소, 테스트 방법, 정상 동작 확인 기준**을 제공합니다.
- **Task 완료 처리**: 단계별 확인이 완료되고 다음 단계로 넘어가기 전, `task.md`의 해당 Task 항목을 `[ ]`에서 `[O]`로 변경하여 완료 처리합니다.
- **변경 사항 기록**: 모든 코드 변경 사항은 PR에 “스냅샷 이미지/GIF + 수용기준 통과 증빙”을 첨부하여 기록을 남깁니다.
- **마이그레이션/배포**: DB 마이그레이션이나 프로덕션 배포와 같은 주요 변경 사항은 배포 체크리스트에 기록을 남깁니다.
