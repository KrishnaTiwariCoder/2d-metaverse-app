"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialGrid = void 0;
const CELL_SIZE = 15;
const PLAYER_SIZE = 15;
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
    addUser(userId, x, y) {
        if (this.users.has(userId)) {
            return;
        }
        const box = this.userCenterToBox(x, y);
        const cellKeys = this.computeOccupiedCellKeys(box);
        this.insertIntoCells(this.userCells, userId, cellKeys);
        this.users.set(userId, { userId, centerX: x, centerY: y, cellKeys });
    }
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
    removeUser(userId) {
        const stored = this.users.get(userId);
        if (!stored)
            return;
        this.removeFromCells(this.userCells, userId, stored.cellKeys);
        this.users.delete(userId);
    }
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
    clear() {
        this.userCells.clear();
        this.elementCells.clear();
        this.users.clear();
        this.elements.clear();
    }
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