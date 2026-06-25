"use strict";
/**
 * SpatialGrid
 * -----------
 * Server-authoritative spatial index for a 2D multiplayer space.
 *
 * Two different position conventions are used on purpose, matching how
 * the WS server (User.ts) already calls this class:
 *
 *   USERS    — (x, y) is the CENTER of a 15x15 box (PLAYER_BOX_SIZE).
 *              addUser/moveUser/hasUserCollision all take a center point.
 *
 *   ELEMENTS — (x, y) is the TOP-LEFT corner of the element's box.
 *              addElement/hasElementCollision take a raw top-left AABB,
 *              exactly as stored on the space document.
 *
 * The grid itself (cell bucketing) is purely a broad-phase index: cell
 * size is 15px, cells are looked up in a sparse Map so empty regions of
 * a large space cost nothing. All actual collision decisions are made
 * with real AABB rectangle intersection on top of whatever candidates
 * the grid returns — never on cell membership alone.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialGrid = void 0;
const CELL_SIZE = 15;
const PLAYER_SIZE = 15; // 15x15 box per spec; center +/- 7.5 on each axis
const PLAYER_HALF = PLAYER_SIZE / 2;
class SpatialGrid {
    cellSize;
    userCells = new Map();
    elementCells = new Map();
    users = new Map();
    elements = new Map();
    constructor(cellSize = CELL_SIZE) {
        this.cellSize = cellSize;
    }
    // ---------------------------------------------------------------------
    // Users — (x, y) is always a CENTER point
    // ---------------------------------------------------------------------
    /** Adds a user to the grid at the given center position. */
    addUser(userId, x, y) {
        if (this.users.has(userId)) {
            // Re-adding an existing id is treated as a no-op rather than a
            // throw, since callers (e.g. a reconnect edge case) shouldn't
            // crash the WS handler over it. RoomManager is responsible for
            // rejecting duplicate joins before this is ever called.
            return;
        }
        const box = this.userCenterToBox(x, y);
        const cellKeys = this.computeOccupiedCellKeys(box);
        this.insertIntoCells(this.userCells, userId, cellKeys);
        this.users.set(userId, { userId, centerX: x, centerY: y, cellKeys });
    }
    /**
     * Commits a move to (x, y). Does NOT check collision — callers
     * (User.ts) are expected to call hasUserCollision / hasElementCollision
     * beforehand and only call this once the move has been approved.
     * No-ops if the user isn't in the grid.
     */
    moveUser(userId, x, y) {
        const stored = this.users.get(userId);
        if (!stored)
            return;
        const newBox = this.userCenterToBox(x, y);
        const newCellKeys = this.computeOccupiedCellKeys(newBox);
        this.updateCells(this.userCells, userId, stored.cellKeys, newCellKeys);
        stored.centerX = x;
        stored.centerY = y;
        stored.cellKeys = newCellKeys;
    }
    /** Removes a user from the grid entirely. No-ops if not present. */
    removeUser(userId) {
        const stored = this.users.get(userId);
        if (!stored)
            return;
        this.removeFromCells(this.userCells, userId, stored.cellKeys);
        this.users.delete(userId);
    }
    /**
     * True if a 15x15 player box centered at (x, y) would overlap any
     * OTHER user currently in the grid. `excludeUserId` is left out of
     * the check (a user never collides with themselves).
     */
    hasUserCollision(x, y, excludeUserId) {
        const box = this.userCenterToBox(x, y);
        const candidateIds = this.getCandidateIds(this.userCells, box);
        for (const candidateId of candidateIds) {
            if (candidateId === excludeUserId)
                continue;
            const other = this.users.get(candidateId);
            if (!other)
                continue;
            const otherBox = this.userCenterToBox(other.centerX, other.centerY);
            if (this.rectsIntersect(box, otherBox)) {
                return true;
            }
        }
        return false;
    }
    // ---------------------------------------------------------------------
    // Elements — (x, y) is always a TOP-LEFT corner
    // ---------------------------------------------------------------------
    /**
     * Adds an element placement to the grid.
     *
     * `instanceId` is the grid's unique key for this specific placement;
     * `templateElementId` is carried along as metadata (e.g. which
     * sprite/asset template this instance came from) and isn't used for
     * any grid logic.
     */
    addElement(instanceId, x, y, width, height, statics, templateElementId) {
        if (this.elements.has(instanceId)) {
            return;
        }
        const box = { x, y, width, height };
        const cellKeys = this.computeOccupiedCellKeys(box);
        this.insertIntoCells(this.elementCells, instanceId, cellKeys);
        this.elements.set(instanceId, {
            instanceId,
            templateElementId,
            x,
            y,
            width,
            height,
            statics,
            cellKeys,
        });
    }
    /** Removes an element placement from the grid. No-ops if not present. */
    removeElement(instanceId) {
        const stored = this.elements.get(instanceId);
        if (!stored)
            return;
        this.removeFromCells(this.elementCells, instanceId, stored.cellKeys);
        this.elements.delete(instanceId);
    }
    /**
     * True if the given top-left-anchored box overlaps any element
     * currently in the grid (static or dynamic — callers decide whether
     * dynamic elements should block movement; today everything does).
     */
    hasElementCollision(x, y, width, height) {
        const box = { x, y, width, height };
        const candidateIds = this.getCandidateIds(this.elementCells, box);
        for (const candidateId of candidateIds) {
            const element = this.elements.get(candidateId);
            if (!element)
                continue;
            if (this.rectsIntersect(box, element)) {
                return true;
            }
        }
        return false;
    }
    // ---------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------
    /**
     * Returns every user and element within `radius` pixels of (x, y).
     * Not currently called from User.ts, but kept for upcoming proximity
     * voice/video and interaction features.
     */
    getNearby(x, y, radius) {
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCellX = Math.floor(x / this.cellSize);
        const centerCellY = Math.floor(y / this.cellSize);
        const users = [];
        const elementsOut = [];
        const seenUsers = new Set();
        const seenElements = new Set();
        for (let cx = centerCellX - cellRadius; cx <= centerCellX + cellRadius; cx++) {
            for (let cy = centerCellY - cellRadius; cy <= centerCellY + cellRadius; cy++) {
                const key = this.cellKey(cx, cy);
                const userBucket = this.userCells.get(key);
                if (userBucket) {
                    for (const userId of userBucket) {
                        if (seenUsers.has(userId))
                            continue;
                        seenUsers.add(userId);
                        const stored = this.users.get(userId);
                        if (!stored)
                            continue;
                        const dx = stored.centerX - x;
                        const dy = stored.centerY - y;
                        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                            users.push({ userId, x: stored.centerX, y: stored.centerY });
                        }
                    }
                }
                const elementBucket = this.elementCells.get(key);
                if (elementBucket) {
                    for (const instanceId of elementBucket) {
                        if (seenElements.has(instanceId))
                            continue;
                        seenElements.add(instanceId);
                        const stored = this.elements.get(instanceId);
                        if (!stored)
                            continue;
                        if (this.distanceToRect(x, y, stored) <= radius) {
                            elementsOut.push(stored);
                        }
                    }
                }
            }
        }
        return { users, elements: elementsOut };
    }
    // ---------------------------------------------------------------------
    // Utility
    // ---------------------------------------------------------------------
    /** Removes every user and element, clearing the grid entirely. */
    clear() {
        this.userCells.clear();
        this.elementCells.clear();
        this.users.clear();
        this.elements.clear();
    }
    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------
    userCenterToBox(centerX, centerY) {
        return {
            x: centerX - PLAYER_HALF,
            y: centerY - PLAYER_HALF,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
        };
    }
    cellKey(cellX, cellY) {
        return `${cellX},${cellY}`;
    }
    computeOccupiedCellKeys(rect) {
        const minCellX = Math.floor(rect.x / this.cellSize);
        const maxCellX = Math.floor((rect.x + rect.width - 1) / this.cellSize);
        const minCellY = Math.floor(rect.y / this.cellSize);
        const maxCellY = Math.floor((rect.y + rect.height - 1) / this.cellSize);
        const keys = new Set();
        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cy = minCellY; cy <= maxCellY; cy++) {
                keys.add(this.cellKey(cx, cy));
            }
        }
        return keys;
    }
    insertIntoCells(cellMap, entityId, cellKeys) {
        for (const key of cellKeys) {
            let bucket = cellMap.get(key);
            if (!bucket) {
                bucket = new Set();
                cellMap.set(key, bucket);
            }
            bucket.add(entityId);
        }
    }
    removeFromCells(cellMap, entityId, cellKeys) {
        for (const key of cellKeys) {
            const bucket = cellMap.get(key);
            if (!bucket)
                continue;
            bucket.delete(entityId);
            if (bucket.size === 0)
                cellMap.delete(key);
        }
    }
    updateCells(cellMap, entityId, oldCellKeys, newCellKeys) {
        for (const key of oldCellKeys) {
            if (!newCellKeys.has(key)) {
                const bucket = cellMap.get(key);
                if (bucket) {
                    bucket.delete(entityId);
                    if (bucket.size === 0)
                        cellMap.delete(key);
                }
            }
        }
        for (const key of newCellKeys) {
            if (!oldCellKeys.has(key)) {
                let bucket = cellMap.get(key);
                if (!bucket) {
                    bucket = new Set();
                    cellMap.set(key, bucket);
                }
                bucket.add(entityId);
            }
        }
    }
    getCandidateIds(cellMap, rect) {
        const cellKeys = this.computeOccupiedCellKeys(rect);
        const candidates = new Set();
        for (const key of cellKeys) {
            const bucket = cellMap.get(key);
            if (!bucket)
                continue;
            for (const id of bucket)
                candidates.add(id);
        }
        return candidates;
    }
    /** Standard AABB intersection. Touching edges do NOT count as overlap. */
    rectsIntersect(a, b) {
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
    }
    distanceToRect(x, y, rect) {
        const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
        const dx = x - closestX;
        const dy = y - closestY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
exports.SpatialGrid = SpatialGrid;
//# sourceMappingURL=index.js.map