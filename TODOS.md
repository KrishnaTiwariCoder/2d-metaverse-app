# TODOS — 2D Metaverse Workspace

> Ordered roadmap. Work top-to-bottom. Each block is a logical commit or milestone.
> Status: `[ ]` pending · `[x]` done · `[~]` in progress

---

## v0.1.0 — Monorepo Bootstrap

```
chore: initialize TurboRepo with frontend, backend, shared packages
```

- [x] Init TurboRepo: `apps/frontend`, `apps/backend`, `packages/shared`
- [x] Configure `turbo.json` pipeline (`build` → `dev` → `lint`)
- [x] Root `package.json` with npm workspaces
- [x] `.env.example` for both apps
- [x] `.gitignore` (node_modules, dist, .env, .turbo)
- [x] Base `tsconfig.json` in `packages/shared`

---

## v0.2.0 — Auth & User Model

```
feat: user registration, login, and JWT auth
```

- [x] `User` Mongoose schema: `username`, `email`, `passwordHash`, `avatarId`, `role` (user | admin)
- [x] `POST /api/v1/auth/register` — bcrypt hash, return JWT
- [x] `POST /api/v1/auth/login` — verify, return JWT + refresh token in httpOnly cookie
- [x] `verifyToken` middleware for protected routes
- [x] `requireAdmin` middleware — checks `role === 'admin'`
- [ ] `POST /api/v1/admin/bootstrap` — one-time route, gated by `ADMIN_SECRET` env var, promotes first admin; disable after use
- [x] `GET /api/v1/users/me` — current user profile
- [x] `PUT /api/v1/users/me` — update username, avatarId

---

## v0.3.0 — Admin: Avatar & Element Catalogue

```
feat: platform admin can create and manage the avatar and element catalogue
```

- [ ] `AvatarDefinition` schema: `name`, `spriteUrl`, `frameWidth`, `frameHeight`
- [x] `POST /api/v1/admin/avatars` 👑
- [x] `GET /api/v1/admin/avatars` 👑
- [x] `PUT /api/v1/admin/avatars/:avatarId` 👑
- [x] `DELETE /api/v1/admin/avatars/:avatarId` 👑
- [x] `ElementDefinition` schema: `name`, `type`, `imageUrl`, `width`, `height`, `static` (bool)
- [x] `POST /api/v1/admin/elements` 👑
- [x] `GET /api/v1/admin/elements` 👑
- [x] `PUT /api/v1/admin/elements/:elementId` 👑
- [x] `DELETE /api/v1/admin/elements/:elementId` 👑 (block if in use by any space)
- [ ] Seed script: insert 1 default avatar and 5 default elements

---

## v0.4.0 — Admin: Map Management

```
feat: platform admin can create and manage maps
```

- [x] `Map` schema: `name`, `width`, `height`, `tilesetUrl`, `thumbnailUrl`, `collisionGrid` (2D array, base64), `defaultSpawnX`, `defaultSpawnY`
- [x] `POST /api/v1/admin/maps` 👑
- [x] `GET /api/v1/admin/maps` 👑
- [x] `PUT /api/v1/admin/maps/:mapId` 👑
- [x] `DELETE /api/v1/admin/maps/:mapId` 👑 (block if used by active space)
- [ ] Seed script: insert 1 default office map

---

## v0.5.0 — User-Facing Catalogue Endpoints

```
feat: expose catalogue (maps, elements, avatars) to authenticated users
```

- [x] `GET /api/v1/maps` 🔒 — list available maps (for space creation picker)
- [x] `GET /api/v1/elements` 🔒 — list element catalogue (for space editor)
- [x] `GET /api/v1/avatars` 🔒 — list avatars (for profile picker)

---

## v0.6.0 — Space CRUD

```
feat: users can create, view, and delete their own spaces
```

- [x] `Space` schema: `name`, `mapId`, `ownerId`, `isPublic`, `inviteToken`
- [x] `SpacePlacement` schema: `spaceId`, `elementId`, `x`, `y`
- [x] `POST /api/v1/spaces` 🔒 — create space; owner = authenticated user
- [x] `GET /api/v1/spaces` 🔒 — list public spaces + user's own spaces
- [x] `GET /api/v1/spaces/:spaceId` 🔒 — full space config with all placements
- [x] `DELETE /api/v1/spaces/:spaceId` 🔒 — owner only
- [x] `requireOwner` middleware

---

## v0.7.0 — Space Element Placements

```
feat: space owners can place, move, and remove catalogue elements in their space
```

- [x] `POST /api/v1/spaces/:spaceId/placements` 🔒 Owner — place a catalogue element at (x, y)
- [x] Validate: elementId must exist in catalogue
- [x] Validate: (x, y) must be within space bounds and not blocked by map collision
- [x] `PUT /api/v1/spaces/:spaceId/placements/:placementId` 🔒 Owner — move element
- [x] `DELETE /api/v1/spaces/:spaceId/placements/:placementId` 🔒 Owner — remove element

---

## v0.8.0 — WebSocket Server & Connection Lifecycle

```
feat: WebSocket server with space-scoped connections
```

- [ ] Attach `ws` server to Express via `server.on('upgrade', ...)`
- [x] On connect: validate JWT from query param; resolve and check space access
- [x] Maintain in-memory map: `spaceId → Set<ConnectedClient>`
- [x] On join: send `space:init` (map info + all placements + all current user positions) to new client
- [x] Broadcast `user:joined` to rest of space
- [x] On disconnect: broadcast `user:left`, remove from map
- [ ] Heartbeat ping/pong to detect dead connections (30s interval)

---

## v0.9.0 — Real-time Movement

```
feat: authoritative server-side avatar movement with collision
```

- [x] On space load, build in-memory collision grid from map's `collisionGrid` + all static placements
- [x] Handle `move { direction }` from client
- [x] Validate move against collision grid; reject if blocked
- [x] Update player position in server-side space state
- [x] Broadcast `user:moved { userId, x, y }` to all clients in space
- [x] Invalidate and rebuild collision grid segment when a placement changes (v0.7.0 feeds this)

---

## v0.10.0 — Live Placement Updates over WebSocket

```
feat: broadcast element placement changes to visitors in real time
```

- [x] When owner calls `POST /placements` → broadcast `placement:added` to space
- [~] When owner calls `PUT /placements/:id` → broadcast `placement:moved` to space
- [~] When owner calls `DELETE /placements/:id` → broadcast `placement:removed` to space
- [ ] Rebuild collision grid on each placement change

---

## v0.11.0 — Frontend: Canvas & Tile Rendering

```
feat: Phaser scene with tile map, catalogue elements, and avatar rendering
```

- [~] Scaffold Phaser 3 inside Vite frontend
- [~] Load map tileset from `tilesetUrl`, render collision grid
- [~] Render placed elements at their (x, y) positions using `imageUrl`
- [~] Render player avatar at spawn; other users from `space:init`
- [~] WASD / arrow keys → emit `move` over WebSocket
- [~] Smooth interpolation on `user:moved` for other avatars
- [~] Display username above each avatar

---

## v0.12.0 — Frontend: Space Owner Editor

```
feat: in-space element placement editor for space owners
```

- [x] "Edit Space" toggle visible only to the space owner
- [x] In edit mode: sidebar lists catalogue elements (fetched from `GET /api/v1/elements`)
- [x] Click element in sidebar → enter placement mode; click tile → POST to `/placements`
- [  ] Click placed element on canvas → show move / delete options
- [x] Updates reflected live via WS broadcasts (v0.10.0)

---

## v0.13.0 — Proximity Detection

```
feat: server-side proximity detection with enter/leave events
```

- [ ] On every `user:moved`, compute tile distance to all other users in space
- [ ] Emit `proximity:enter { userId }` when distance ≤ threshold (configurable, default 3 tiles)
- [ ] Emit `proximity:leave { userId }` when distance > threshold
- [ ] Track proximity state per-user-pair to avoid repeated events
- [ ] Frontend: render a subtle glow ring around avatars in proximity range

---

## v0.14.0 — Text Chat

```
feat: space-scoped real-time text chat
```

- [x] Handle `chat:message { text }` from client (max 500 chars, strip HTML)
- [x] Broadcast `chat:message { userId, username, text, timestamp }` to space
- [ ] On `space:init`, include last 50 messages from DB
- [ ] Persist messages to MongoDB (simple `ChatMessage` schema)
- [ ] Frontend: chat panel toggled with `C` key

---

## v0.15.0 — Private Spaces & Invite Tokens

```
feat: private spaces with shareable invite tokens
```

- [ ] `isPublic: false` spaces block WS join from non-owner
- [ ] `POST /api/v1/spaces/:spaceId/invite` 🔒 Owner — generate a short-lived token (JWT, 24h)
- [ ] `POST /api/v1/spaces/join/:token` 🔒 — validate token, grant access for the session
- [ ] Owner can regenerate/revoke invite token

---

## v0.16.0 — Element Interactions & User Status

```
feat: element interactions and visible user status badges
```

- [ ] Handle `interact { placementId }` from client
- [ ] Validate user is adjacent to the placement
- [ ] Chair: mark tile occupied, set user status `sitting`
- [ ] Focus Zone: set user status `focus`
- [ ] Broadcast `user:status { userId, status }` to space
- [ ] Frontend: status badges above avatars (🟢 available, 🧘 focus, 💺 sitting)

---

## v0.17.0 — TypeScript Migration (Backend)

```
chore: migrate backend from JavaScript to TypeScript
```

- [ ] Add `tsconfig.json` to `apps/backend`
- [ ] Rename `.js` → `.ts`, resolve type errors
- [ ] WS message payloads use types from `packages/shared`
- [ ] Mongoose models use typed interfaces
- [ ] Update `turbo.json` build pipeline for TS compilation step

---

## v1.0.0 — Production Hardening

```
chore: rate limiting, error handling, indexes, Docker setup
```

- [ ] Rate limiting on REST endpoints (`express-rate-limit`)
- [ ] Global error handler middleware (structured JSON error responses)
- [ ] WS graceful error handling — invalid JSON, unknown message types
- [ ] MongoDB indexes: `spaceId` on placements + messages, `ownerId` on spaces
- [ ] Environment-aware CORS config
- [ ] Docker Compose: `frontend`, `backend`, `mongo` services
- [ ] `README.md` setup guide verified end-to-end on a fresh machine
- [ ] Basic load test: 50 concurrent WS clients across 3 spaces

---

## v1.1.0 — Audio / Video (WebRTC) ⚠️ Deliberately Deferred

```
feat: proximity-triggered voice/video via WebRTC SFU
```

> **Deferred until v1.0.0 is stable.** Raw `RTCPeerConnection` doesn't scale for
> group rooms — you get N² peer connections as users grow. The right path is an
> **SFU (Selective Forwarding Unit)**: every client connects once, to the server,
> which forwards media streams selectively.
>
> **Recommended: LiveKit** (open source, self-hostable, Node.js SDK available).
> Signaling (`offer`, `answer`, `ice-candidate`) can reuse the existing WebSocket.
> Trigger call setup on `proximity:enter`, tear down on `proximity:leave`.

- [ ] Evaluate LiveKit vs mediasoup for SFU
- [ ] Deploy LiveKit server (Docker)
- [ ] Signaling: exchange WebRTC offer/answer/ICE via existing WS
- [ ] Auto-connect voice on `proximity:enter`
- [ ] Auto-disconnect on `proximity:leave`
- [ ] Mute/unmute button in HUD
- [ ] Spatial audio: volume falloff by tile distance (Web Audio API `GainNode`)

---

## Backlog (Unscheduled)

- [ ] Multiple floors / space transitions via door elements
- [ ] Screen share (WebRTC data channel or iframe embed)
- [ ] URL-embed triggered by computer elements
- [ ] Space templates the admin can publish (office, classroom, lounge)
- [ ] Space analytics for owners (active users over time, peak hours)
- [ ] Mobile touch controls (virtual D-pad)
- [ ] Dark mode UI
