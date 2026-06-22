# 2D Metaverse Workspace Platform

> A real-time 2D virtual workspace where users create their own office spaces, place elements from a platform catalogue, and move around with other people — like a digital office floor you can actually walk around in.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Role Model](#role-model)
3. [Feature List](#feature-list)
4. [Tech Stack](#tech-stack)
5. [Dependency Explanations](#dependency-explanations)
6. [Setup Guide](#setup-guide)
7. [API Documentation](#api-documentation)
8. [Project Structure](#project-structure)
9. [Contributing](#contributing)

---

## Architecture Overview

The platform is a **monorepo** managed by TurboRepo with three packages: `apps/frontend`, `apps/backend`, and `packages/shared` (types + utils shared across both).

```
Client (Vite + TypeScript)
        │
        ├── HTTP REST ──────────────► Node.js API Server ◄──── MongoDB
        │   (auth, space CRUD,                │              (users, spaces,
        │    element placement)               │               maps, catalogue)
        │                                     │
        └── WebSocket ─────────────► Real-time Spatial Engine
            (movement, chat,           ├── Position sync
             proximity events)         ├── Collision detection
                                       └── Proximity detection
```

### Key Design Decisions

**Three-tier role model:** The platform has a hard separation between the *platform admin* (controls the catalogue — maps, element definitions, avatars), *space owners* (create spaces on top of the catalogue), and *visitors* (join and move around). Space owners cannot create or upload assets; they only configure their space using what the admin has made available.

**Authoritative server movement:** All avatar positions are resolved on the server. The client sends intent (`move: { direction }`), the server validates against the space's collision map, and broadcasts the resolved position to everyone in that space. This prevents desync and cheating.

**Space = isolated room:** Each space has its own WebSocket scope. A client only receives events from the space they are currently in. Joining a new space auto-leaves the previous one.

**Collision map is derived at runtime:** When a space is loaded, the server builds an in-memory collision grid from the space's placed elements plus the base map's wall tiles. This grid is used by the movement engine without hitting MongoDB on every move.

**Element catalogue is admin-only:** Users browse and place elements from a pre-defined catalogue. There is no user-side asset upload. This keeps the asset pipeline simple and the platform visually consistent.

---

## Role Model

| Role | Who | What they control |
|---|---|---|
| **Platform Admin** | You / the platform operator | Maps, element catalogue (type, image, collision), avatar catalogue |
| **Space Owner** | Any registered user | Create a space, pick a map, place/move/remove catalogue elements within their space |
| **Visitor / Member** | Any registered user | Join a space, move avatar, interact with elements, chat |

A user is always a visitor in other people's spaces and an owner only in spaces they created.

---

## Feature List

### Platform Admin (Backend/Dashboard)

- Create and manage **maps** (base tileset, dimensions, wall layout, spawn point)
- Create and manage the **element catalogue** (name, type, image, is-static, collision shape)
- Create and manage the **avatar catalogue** (sprite sheets, animation frames)
- Global user management (ban, role assignment)

### Space Owners

- Create a named space on top of a chosen map
- Set space to **public** (joinable by link) or **private** (owner must share invite link)
- Place, move, and remove elements from the catalogue onto the space grid
- Delete their own space

### Visitors / Members

- Browse and join public spaces
- Join private spaces via invite link
- Move avatar in real time (WASD / arrow keys)
- Collision detection against walls and static elements
- Proximity detection — know when another user is nearby
- Text chat scoped to the current space

### Elements (Catalogue Types)

| Type | Behaviour |
|---|---|
| Chair | Occupiable; avatar enters "sitting" state |
| Table | Static boundary, blocks movement |
| Computer | Static; triggers an embed/URL (planned) |
| Reception Counter | Static boundary / zone marker |
| Focus Zone | Entering sets user status to "focus mode" |
| Tree / Decor | Static decorative, blocks movement |

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Vite + TypeScript | Fast HMR, native TS, minimal config |
| 2D Rendering | Phaser 3 | Handles tile maps, sprite sheets, game loop, input |
| Backend | Node.js (JS → TS migration planned) | Non-blocking I/O suits WebSocket-heavy workloads |
| Database | MongoDB | Flexible schema for map configs and element catalogues |
| Real-time | `ws` (raw WebSockets) | Low latency, no Socket.IO overhead |
| Monorepo | TurboRepo | Shared packages, parallel task execution, build caching |

---

## Dependency Explanations

### Frontend

**`vite`** — Build tool and dev server. Sub-second HMR and native ESM output. Configured at `apps/frontend/vite.config.ts`.

**`phaser`** — 2D game framework. Handles the tile map renderer, sprite animation, input manager, and game loop. The alternative (raw Canvas API) would require reimplementing all of this from scratch.

**`typescript`** — Static typing. Shared type definitions (WS message payloads, API response shapes) come from `packages/shared` and are imported in both the frontend and backend.

### Backend

**`express`** — HTTP server for all REST endpoints (auth, admin CRUD, space management). Runs on the same Node.js server as the WS engine, using the `upgrade` event to hand WebSocket connections to `ws`.

**`ws`** — Lightweight WebSocket library. Chosen over Socket.IO to avoid the abstraction overhead; the spatial engine needs direct control over message framing and connection lifecycle.

**`mongoose`** — MongoDB ODM. Schemas for `User`, `Map`, `ElementDefinition`, `AvatarDefinition`, `Space`, and `SpacePlacement` live in `packages/shared/models` so both apps share the same type contracts.

**`jsonwebtoken`** — Stateless auth via JWTs. Short-lived access tokens (15 min); refresh tokens in httpOnly cookies.

**`bcryptjs`** — Password hashing before storage.

**`dotenv`** — Environment variable loading from `.env` files per app.

### Monorepo

**`turbo`** — Understands the dependency graph between packages. `turbo dev` starts frontend and backend in the correct order with build caching across runs.

---

## Setup Guide

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas URI)
- npm v9+

### 1. Clone

```bash
git clone https://github.com/[your-username]/2d-metaverse-workspace.git
cd 2d-metaverse-workspace
```

### 2. Install

```bash
npm install
```

TurboRepo installs dependencies for all workspaces from the root.

### 3. Environment Variables

**`apps/backend/.env`**
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/metaverse
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
ADMIN_SECRET=your_admin_bootstrap_secret
```

**`apps/frontend/.env`**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

> `ADMIN_SECRET` is used to bootstrap the first platform admin account via `POST /api/v1/admin/bootstrap`. Remove or rotate it after first use.

### 4. Build Shared Package

```bash
npm run build --workspace=packages/shared
```

### 5. Run Development

```bash
npm run dev
```

Starts frontend on `http://localhost:5173` and backend on `http://localhost:3000`.

### 6. Seed Catalogue (optional)

```bash
npm run seed --workspace=apps/backend
```

Inserts a default map and basic element catalogue so you can test without manual admin setup.

### 7. Production Build

```bash
npm run build
npm run start
```

---

## API Documentation

Base path: `/api/v1`  
Auth: `Authorization: Bearer <token>` on all protected routes.  
🔒 = requires login · 👑 = requires platform admin

---

### Auth

#### `POST /api/v1/auth/register`
**Public.** Create a user account.

**Body:**
```json
{ "username": "krishna", "email": "k@example.com", "password": "pass123" }
```
**Response `201`:**
```json
{ "userId": "u_abc", "username": "krishna", "token": "<jwt>" }
```

---

#### `POST /api/v1/auth/login`
**Public.**

**Body:**
```json
{ "email": "k@example.com", "password": "pass123" }
```
**Response `200`:**
```json
{ "token": "<jwt>", "user": { "userId": "u_abc", "username": "krishna", "avatarId": "av_01" } }
```

---

### Admin — Maps

#### `POST /api/v1/admin/maps` 👑
Create a map.

**Body:**
```json
{
  "name": "Default Office",
  "width": 40,
  "height": 30,
  "thumbnailUrl": "/assets/maps/office_thumb.png",
  "tilesetUrl": "/assets/maps/office_tiles.png",
  "collisionGrid": "base64-encoded-2d-array",
  "defaultSpawnX": 5,
  "defaultSpawnY": 5
}
```
**Response `201`:** `{ "mapId": "map_01" }`

---

#### `GET /api/v1/admin/maps` 👑
List all maps.

#### `PUT /api/v1/admin/maps/:mapId` 👑
Update map metadata or collision grid.

#### `DELETE /api/v1/admin/maps/:mapId` 👑
Delete a map (fails if any active space uses it).

---

### Admin — Element Catalogue

#### `POST /api/v1/admin/elements` 👑
Add an element to the catalogue.

**Body:**
```json
{
  "name": "Office Chair",
  "type": "chair",
  "imageUrl": "/assets/elements/chair.png",
  "width": 1,
  "height": 1,
  "static": true
}
```
**Response `201`:** `{ "elementId": "el_def_01" }`

---

#### `GET /api/v1/admin/elements` 👑
List all catalogue elements.

#### `PUT /api/v1/admin/elements/:elementId` 👑
Update element definition (image, collision, type).

#### `DELETE /api/v1/admin/elements/:elementId` 👑
Remove from catalogue (fails if placed in any active space).

---

### Admin — Avatar Catalogue

#### `POST /api/v1/admin/avatars` 👑
Add an avatar to the catalogue.

**Body:**
```json
{ "name": "Blue Character", "spriteUrl": "/assets/avatars/blue.png", "frameWidth": 48, "frameHeight": 48 }
```
**Response `201`:** `{ "avatarId": "av_01" }`

#### `GET /api/v1/admin/avatars` 👑
List all avatars.

#### `PUT /api/v1/admin/avatars/:avatarId` 👑
Update avatar.

#### `DELETE /api/v1/admin/avatars/:avatarId` 👑
Remove avatar.

---

### Catalogue (Public/User-facing)

#### `GET /api/v1/elements` 🔒
Returns the full element catalogue. Used by space owners when placing elements.

**Response `200`:**
```json
[
  { "elementId": "el_def_01", "name": "Office Chair", "type": "chair", "imageUrl": "/assets/elements/chair.png", "width": 1, "height": 1 }
]
```

#### `GET /api/v1/avatars` 🔒
Returns available avatars for the user to pick from.

#### `GET /api/v1/maps` 🔒
Returns available maps for space creation.

---

### Spaces

#### `POST /api/v1/spaces` 🔒
Create a space. The authenticated user becomes the owner.

**Body:**
```json
{ "name": "Engineering Office", "mapId": "map_01", "isPublic": true }
```
**Response `201`:**
```json
{ "spaceId": "sp_xyz", "joinLink": "https://app.example.com/space/sp_xyz" }
```

---

#### `GET /api/v1/spaces` 🔒
List public spaces + spaces the user owns.

---

#### `GET /api/v1/spaces/:spaceId` 🔒
Full space state: map info, all placed elements with positions.

**Response `200`:**
```json
{
  "spaceId": "sp_xyz",
  "name": "Engineering Office",
  "mapId": "map_01",
  "isPublic": true,
  "owner": { "userId": "u_abc", "username": "krishna" },
  "placements": [
    { "placementId": "pl_01", "elementId": "el_def_01", "x": 5, "y": 10 }
  ]
}
```

---

#### `DELETE /api/v1/spaces/:spaceId` 🔒 Owner only

---

### Space Element Placements

All placement routes require the authenticated user to be the **space owner**.

#### `POST /api/v1/spaces/:spaceId/placements` 🔒 Owner only
Place a catalogue element onto the space grid.

**Body:**
```json
{ "elementId": "el_def_01", "x": 5, "y": 10 }
```
**Response `201`:** `{ "placementId": "pl_01" }`

---

#### `PUT /api/v1/spaces/:spaceId/placements/:placementId` 🔒 Owner only
Move a placed element.

**Body:** `{ "x": 6, "y": 10 }`

---

#### `DELETE /api/v1/spaces/:spaceId/placements/:placementId` 🔒 Owner only
Remove a placed element.

---

### User

#### `GET /api/v1/users/me` 🔒
**Response `200`:**
```json
{ "userId": "u_abc", "username": "krishna", "email": "k@example.com", "avatarId": "av_01" }
```

#### `PUT /api/v1/users/me` 🔒
Update username or avatarId.

---

### WebSocket

Connect: `ws://localhost:3000?token=<jwt>&spaceId=<spaceId>`

The server validates the token and that the space is accessible (public, or user is owner) on the `upgrade` handshake. Invalid connections are closed with code `4001` (auth) or `4003` (space not found / forbidden).

---

**Client → Server messages:**

| Type | Payload | Description |
|---|---|---|
| `move` | `{ "direction": "up" \| "down" \| "left" \| "right" }` | Request avatar movement |
| `interact` | `{ "placementId": "pl_01" }` | Interact with a placed element |
| `chat:message` | `{ "text": "hello" }` | Send chat message (max 500 chars) |

---

**Server → Client messages:**

| Type | Payload | Description |
|---|---|---|
| `space:init` | Full space state + all current user positions | Sent once on successful join |
| `user:joined` | `{ userId, username, avatarId, x, y }` | Another user entered |
| `user:left` | `{ userId }` | A user disconnected |
| `user:moved` | `{ userId, x, y }` | Authoritative position update |
| `proximity:enter` | `{ userId }` | Another user entered proximity range |
| `proximity:leave` | `{ userId }` | User left proximity range |
| `placement:added` | `{ placementId, elementId, x, y }` | Owner added an element (live) |
| `placement:moved` | `{ placementId, x, y }` | Owner moved an element (live) |
| `placement:removed` | `{ placementId }` | Owner removed an element (live) |
| `chat:message` | `{ userId, username, text, timestamp }` | New chat message |
| `error` | `{ code, message }` | Server-side error |

> Element placement changes by the owner are broadcast live so visitors see the space update in real time without refreshing.

---

## Project Structure

```
2d-metaverse-workspace/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── game/           # Phaser scenes, tile map, avatar rendering
│   │       ├── components/     # HUD, chat panel, space picker UI
│   │       ├── hooks/          # useWebSocket, useAuth
│   │       └── store/          # Client state (positions, chat, space info)
│   └── backend/
│       └── src/
│           ├── routes/
│           │   ├── auth.js
│           │   ├── admin.js     # Maps, element catalogue, avatar catalogue
│           │   ├── spaces.js    # Space CRUD + placements
│           │   └── users.js
│           ├── ws/
│           │   ├── server.js    # WS upgrade handler, connection map
│           │   ├── spatial.js   # Movement validation, collision grid
│           │   └── proximity.js # Distance calculation, enter/leave events
│           ├── models/          # Mongoose schemas
│           └── middleware/      # verifyToken, requireAdmin, requireOwner
├── packages/
│   └── shared/
│       ├── types/               # WS message types, API response types
│       └── models/              # Shared Mongoose schema definitions
└── turbo.json
```

---

## Contributing

1. Fork the repo
2. Check `TODOS.md` for the current milestone
3. Branch: `git checkout -b feat/your-feature`
4. Commit with conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
5. Open a PR against `main`

---

## Contact

[Krishna Tiwari](https://www.linkedin.com/in/krsna-tiwari/)
