const CELL_SIZE = 15;
const PLAYER_SIZE = 15;
const PLAYER_HALF = PLAYER_SIZE / 2;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StoredUser {
  userId: string;
  centerX: number;
  centerY: number;
  cellKeys: Set<string>;
}

interface StoredElement {
  instanceId: string;
  templateElementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  statics: boolean;
  cellKeys: Set<string>;
}

export interface NearbyResult {
  users: { userId: string; x: number; y: number }[];
  elements: StoredElement[];
}

export class SpatialGrid {
  private readonly cellSize: number;

  private readonly userCells: Map<string, Set<string>> = new Map();
  private readonly elementCells: Map<string, Set<string>> = new Map();

  private readonly users: Map<string, StoredUser> = new Map();
  private readonly elements: Map<string, StoredElement> = new Map();

  constructor(cellSize: number = CELL_SIZE) {
    this.cellSize = cellSize;
  }


  addUser(userId: string, x: number, y: number): void {
    if (this.users.has(userId)) {
      return;
    }

    const box = this.userCenterToBox(x, y);
    const cellKeys = this.computeOccupiedCellKeys(box);
    this.insertIntoCells(this.userCells, userId, cellKeys);

    this.users.set(userId, { userId, centerX: x, centerY: y, cellKeys });
  }

  moveUser(userId: string, x: number, y: number): void {
    const stored = this.users.get(userId);
    if (!stored) return;

    const newBox = this.userCenterToBox(x, y);
    const newCellKeys = this.computeOccupiedCellKeys(newBox);

    this.updateCells(this.userCells, userId, stored.cellKeys, newCellKeys);

    stored.centerX = x;
    stored.centerY = y;
    stored.cellKeys = newCellKeys;
  }

  removeUser(userId: string): void {
    const stored = this.users.get(userId);
    if (!stored) return;

    this.removeFromCells(this.userCells, userId, stored.cellKeys);
    this.users.delete(userId);
  }

  hasUserCollision(x: number, y: number, excludeUserId: string): boolean {
    const box = this.userCenterToBox(x, y);
    const candidateIds = this.getCandidateIds(this.userCells, box);

    for (const candidateId of candidateIds) {
      if (candidateId === excludeUserId) continue;

      const other = this.users.get(candidateId);
      if (!other) continue;

      const otherBox = this.userCenterToBox(other.centerX, other.centerY);
      if (this.rectsIntersect(box, otherBox)) {
        return true;
      }
    }

    return false;
  }

  addElement(
    instanceId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    statics: boolean,
    templateElementId: string
  ): void {
    if (this.elements.has(instanceId)) {
      return;
    }

    const box: Rect = { x, y, width, height };
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
  removeElement(instanceId: string): void {
    const stored = this.elements.get(instanceId);
    if (!stored) return;

    this.removeFromCells(this.elementCells, instanceId, stored.cellKeys);
    this.elements.delete(instanceId);
  }

  hasElementCollision(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const box: Rect = { x, y, width, height };
    const candidateIds = this.getCandidateIds(this.elementCells, box);

    for (const candidateId of candidateIds) {
      const element = this.elements.get(candidateId);
      if (!element) continue;

      if (this.rectsIntersect(box, element)) {
        return true;
      }
    }

    return false;
  }

  getNearby(x: number, y: number, radius: number): NearbyResult {
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(x / this.cellSize);
    const centerCellY = Math.floor(y / this.cellSize);

    const users: NearbyResult["users"] = [];
    const elementsOut: StoredElement[] = [];
    const seenUsers = new Set<string>();
    const seenElements = new Set<string>();

    for (let cx = centerCellX - cellRadius; cx <= centerCellX + cellRadius; cx++) {
      for (let cy = centerCellY - cellRadius; cy <= centerCellY + cellRadius; cy++) {
        const key = this.cellKey(cx, cy);

        const userBucket = this.userCells.get(key);
        if (userBucket) {
          for (const userId of userBucket) {
            if (seenUsers.has(userId)) continue;
            seenUsers.add(userId);
            const stored = this.users.get(userId);
            if (!stored) continue;
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
            if (seenElements.has(instanceId)) continue;
            seenElements.add(instanceId);
            const stored = this.elements.get(instanceId);
            if (!stored) continue;
            if (this.distanceToRect(x, y, stored) <= radius) {
              elementsOut.push(stored);
            }
          }
        }
      }
    }

    return { users, elements: elementsOut };
  }

  clear(): void {
    this.userCells.clear();
    this.elementCells.clear();
    this.users.clear();
    this.elements.clear();
  }


  private userCenterToBox(centerX: number, centerY: number): Rect {
    return {
      x: centerX - PLAYER_HALF,
      y: centerY - PLAYER_HALF,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
    };
  }

  private cellKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`;
  }

  private computeOccupiedCellKeys(rect: Rect): Set<string> {
    const minCellX = Math.floor(rect.x / this.cellSize);
    const maxCellX = Math.floor((rect.x + rect.width - 1) / this.cellSize);
    const minCellY = Math.floor(rect.y / this.cellSize);
    const maxCellY = Math.floor((rect.y + rect.height - 1) / this.cellSize);

    const keys = new Set<string>();
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        keys.add(this.cellKey(cx, cy));
      }
    }
    return keys;
  }

  private insertIntoCells(
    cellMap: Map<string, Set<string>>,
    entityId: string,
    cellKeys: Set<string>
  ): void {
    for (const key of cellKeys) {
      let bucket = cellMap.get(key);
      if (!bucket) {
        bucket = new Set<string>();
        cellMap.set(key, bucket);
      }
      bucket.add(entityId);
    }
  }

  private removeFromCells(
    cellMap: Map<string, Set<string>>,
    entityId: string,
    cellKeys: Set<string>
  ): void {
    for (const key of cellKeys) {
      const bucket = cellMap.get(key);
      if (!bucket) continue;
      bucket.delete(entityId);
      if (bucket.size === 0) cellMap.delete(key);
    }
  }

  private updateCells(
    cellMap: Map<string, Set<string>>,
    entityId: string,
    oldCellKeys: Set<string>,
    newCellKeys: Set<string>
  ): void {
    for (const key of oldCellKeys) {
      if (!newCellKeys.has(key)) {
        const bucket = cellMap.get(key);
        if (bucket) {
          bucket.delete(entityId);
          if (bucket.size === 0) cellMap.delete(key);
        }
      }
    }
    for (const key of newCellKeys) {
      if (!oldCellKeys.has(key)) {
        let bucket = cellMap.get(key);
        if (!bucket) {
          bucket = new Set<string>();
          cellMap.set(key, bucket);
        }
        bucket.add(entityId);
      }
    }
  }

  private getCandidateIds(
    cellMap: Map<string, Set<string>>,
    rect: Rect
  ): Set<string> {
    const cellKeys = this.computeOccupiedCellKeys(rect);
    const candidates = new Set<string>();
    for (const key of cellKeys) {
      const bucket = cellMap.get(key);
      if (!bucket) continue;
      for (const id of bucket) candidates.add(id);
    }
    return candidates;
  }

  private rectsIntersect(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private distanceToRect(x: number, y: number, rect: Rect): number {
    const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
    const dx = x - closestX;
    const dy = y - closestY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}