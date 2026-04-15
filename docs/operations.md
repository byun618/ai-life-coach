# Operations

ai-life-coach를 클론/디버깅/재구동할 때 코드만 봐서는 알기 힘든 운영 노하우 모음. 설계 의도는 BRAIN(`~/brain/projects/ai-life-coach/`) 참조.

## 인프라 / 실행 환경

**개발 장비 분리** — 개발은 맥북, 실행/DB는 맥미니 홈서버 기준. 운영도 맥미니에서 돈다.
출처: 메모리 `user_dev_environment.md`

**DB는 홈서버 Postgres 16** — `~/repos/byun618/homelab-infra/docker/compose.yaml`로 띄운 Postgres 컨테이너 사용. 볼륨 `~/.db/postgres`. 초기화 스크립트는 `~/repos/byun618/homelab-infra/db/postgres-scripts`. 5432 포트가 LAN에서 열려 있어야 한다.
출처: 메모리 `user_dev_environment.md`

**Postgres 사용자 분리** — root(`postgres`/`POSTGRES_ROOT_PASSWORD`) 말고 앱 전용 계정 `ai_life_coach` 사용. 비번은 homelab-infra `.env`의 `AI_LIFE_COACH_DB_PASSWORD`. `DATABASE_URL`은 이 계정 기준으로 조립.
출처: 메모리 `user_dev_environment.md`

**Expo Go 실기기 테스트** — Android Studio/에뮬레이터 없이 Android 폰 + Expo Go. 폰과 맥북이 같은 WiFi여야 하고, `apps/app/lib/config.ts:4`의 `API_URL` 기본값이 `http://192.168.35.7:3000`로 하드코딩돼 있다. 네트워크 바뀌면 `EXPO_PUBLIC_API_URL`로 덮어써야 한다.
출처: `apps/app/lib/config.ts`

## 환경 변수

API (`apps/api/.env.example`) 최소 집합:
- `DATABASE_URL` — `postgres://ai_life_coach:...@localhost:5432/ai_life_coach`
- `BRAIN_REPO_PATH` — Claude CLI의 작업 디렉토리이자 코치 시스템 프롬프트에 노출되는 경로. 실제 brain 레포를 가리켜야 함. 미설정 시 `process.cwd()` fallback.
- `SERVER_TOKEN` — `.env.example`에만 있고 코드에 검증 없음 (미구현).
- `PORT` — 기본 3000. `main.ts`가 `0.0.0.0`로 바인딩해 LAN 공개.

**`.env.example`에 빠진 실제 사용 키:**
- `CLAUDE_CLI_PATH` (`claude-cli.service.ts:33`) — 미설정 시 `claude` 바이너리가 PATH에 있어야 한다. 맥미니에 Claude CLI가 로그인된 상태로 설치돼 있다는 전제.
- `INTERNAL_API_URL` (`chat.controller.ts:69`) — Claude CLI가 curl로 호출할 API의 자기 자신 URL. 미설정 시 `http://localhost:3000`. 원격 실행 시 조정.
- `NODE_ENV` (`mikro-orm.config.ts:38`) — `production`이 아니면 SQL debug 로그가 켜진다.

## AI 통합 (Claude Code CLI spawn)

**과금 0 전략** — Claude API 대신 Claude Code CLI(Claude Max 구독)를 `child_process.spawn()`으로 돌리고 stream-json을 파싱한다. API 키 없음.
출처: 메모리 `project_ai_life_coach.md`, `claude-cli.service.ts`

**CLI 인자 고정값** (`claude-cli.service.ts:38-57`):

```
--print --output-format stream-json --verbose --include-partial-messages
--model sonnet --permission-mode bypassPermissions
--allowedTools "Bash(curl:*) Read Glob Grep"
```

`bypassPermissions` + `Bash(curl:*)` 조합은 시스템 프롬프트(`chat.service.ts:131-142`)가 대화 도중 자동으로 curl로 REST API를 호출해 Goal/Record를 저장하기 때문. "본인 전용"이라 가능. 외부 노출 절대 금지.

**세션 관리 규칙** — 첫 호출은 `--session-id <uuid>`, 같은 대화방에서 이어갈 땐 `--resume <sessionId>`. `--session-id`를 두 번째로 쓰면 CLI가 에러. 판정은 `chat.service.ts:getClaudeSession()` — AI 메시지가 DB에 1건이라도 있으면 resume.
출처: 메모리 `project_ai_life_coach.md`, `chat.service.ts:76-101`

**SSE 스트리밍** — 백엔드 `@Sse('rooms/:roomId/stream')`, 앱은 `react-native-sse` 사용. WebSocket/fetch-stream 아님.
출처: `chat.controller.ts`, `apps/app/package.json`

**Claude CLI cwd = BRAIN_REPO_PATH** — spawn 시 cwd를 brain 레포로 두기 때문에 CLI 내부 Read/Glob/Grep이 brain 마크다운을 자유롭게 탐색. 배포 시 이 경로가 실제 clone된 brain 레포여야 한다.
출처: `claude-cli.service.ts:34,62`, `chat.service.ts:119`

**MVP 단일 사용자** — `USER_ID = '00000000-0000-0000-0000-000000000001'`로 하드코딩(`apps/app/lib/config.ts:7`). 이 UUID의 User row가 DB에 seed되지 않으면 `/chat/rooms/global`이 404. 초기 셋업 시 수동 INSERT 필요.
출처: `apps/app/lib/config.ts`, `chat.service.ts:20-23`

## 의존성 버전 핀

**MikroORM `^6`** — v7은 `@mikro-orm/core`의 `Entity`, `PrimaryKey` 등 데코레이터 export 경로가 바뀌어 `has no exported member` 에러, ESM loader `node:fs is not in cache` 에러. 전 패키지(`core`, `postgresql`, `nestjs`, `migrations`, `cli`)를 `^6` 고정. lock된 버전은 6.6.12.
출처: 메모리 `feedback_mikroorm_v7_breaking.md`, `apps/api/package.json:32-48`

**Expo SDK 54 + pnpm 모노레포 자동 지원** — SDK 52+부터 pnpm isolated 구조 자동 지원. `apps/app/`에 `metro.config.js` 만들지 말 것, 루트 `.npmrc`에 `node-linker=hoisted` 넣지 말 것. 수동 설정은 "Unable to resolve ../../App" 에러 유발. 캐시 꼬이면 `pnpm exec expo start --clear`.
출처: 메모리 `feedback_pnpm_expo.md`

**Reanimated 4 → `react-native-worklets/plugin` 필수** — `apps/app/babel.config.js`의 plugins에 `react-native-worklets/plugin` 있어야 reanimated 4 동작.
출처: 메모리 `project_ai_life_coach.md`, `apps/app/babel.config.js:5`

**Node/pnpm** — 루트 `package.json`: `engines.node >= 18`, `packageManager: pnpm@10.8.1`. 실제 개발 Node 20.20.2.
출처: `package.json:22-25`, 메모리 `user_dev_environment.md`

**React Native 새 아키텍처** — `apps/app/app.json`에 `newArchEnabled: true`. 라이브러리 추가 시 Fabric 호환 확인.
출처: `apps/app/app.json:10`

## DB / 마이그레이션

**단일 마이그레이션** — `apps/api/migrations/Migration20260405082513.ts`. Phase 1 스키마 그대로. 엔티티 변경 시 `pnpm --filter api orm migration:create`.
출처: `apps/api/package.json:21`

**테이블 목록** — users, goals, subtasks, chat_rooms, messages, records, nudge_settings, sync_states, push_devices.

**`sync_states.id` 기본값 `'singleton'`** — 싱글 row 패턴. PK가 varchar이고 고정 문자열 `'singleton'`. INSERT 시 id 생략 가능.
출처: `Migration20260405082513.ts:8`

**엔티티 등록은 수동 배열** — `src/mikro-orm.config.ts`가 glob discovery 대신 엔티티를 직접 import. 새 엔티티 추가 시 `entities` 배열과 `src/entities/index.ts` 둘 다 업데이트.
출처: `src/mikro-orm.config.ts:5-31`

**Migrator는 `extensions: [Migrator]`로 등록** — v6 패턴. 빠지면 CLI 마이그레이션 명령 동작 안 함.
출처: `src/mikro-orm.config.ts:32`

## 네트워킹 / CORS

**CORS 와일드카드** — `main.ts:6`의 `app.enableCors()`는 옵션 없이 호출 → 모든 origin 허용. 본인 전용 LAN이라 OK. 외부 노출 시 조정.

**API 바인딩 `0.0.0.0`** — `main.ts:7`. 폰 실기기가 LAN IP로 붙는 전제 조건.

## 모노레포 / 빌드

**Turbo 태스크는 `build`, `lint`, `check-types`, `dev`만** — `test` 없음. 테스트는 `apps/api`에서 직접 `pnpm test`.
출처: `turbo.json`

**`onlyBuiltDependencies` 핀** — 루트 `package.json`에 `@nestjs/core`, `unrs-resolver`만 허용. pnpm 10 기본이 post-install 스크립트 차단이므로 명시 필요.
출처: `package.json:16-21`

**Workspace** — `apps/*` + `packages/*`. 내부 패키지 `@ai-life-coach/shared`(타입), `typescript-config`(tsconfig presets).
출처: `pnpm-workspace.yaml`, `packages/`

## 워크트리 정리 주의

**`git worktree remove`만, 브랜치는 손대지 말 것** — 워크트리 정리한다고 브랜치까지 지우면 작업 소실 위험.
출처: 메모리 `feedback_worktree_cleanup.md`
