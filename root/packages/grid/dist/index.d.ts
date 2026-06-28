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
    users: {
        userId: string;
        x: number;
        y: number;
    }[];
    elements: StoredElement[];
}
export declare class SpatialGrid {
    private readonly cellSize;
    private readonly userCells;
    private readonly elementCells;
    private readonly users;
    private readonly elements;
    constructor(cellSize?: number);
    addUser(userId: string, x: number, y: number): void;
    moveUser(userId: string, x: number, y: number): void;
    removeUser(userId: string): void;
    hasUserCollision(x: number, y: number, excludeUserId: string): boolean;
    addElement(instanceId: string, x: number, y: number, width: number, height: number, statics: boolean, templateElementId: string): void;
    /** Removes an element placement from the grid. No-ops if not present. */
    removeElement(instanceId: string): void;
    hasElementCollision(x: number, y: number, width: number, height: number): boolean;
    getNearby(x: number, y: number, radius: number): NearbyResult;
    clear(): void;
    private userCenterToBox;
    private cellKey;
    private computeOccupiedCellKeys;
    private insertIntoCells;
    private removeFromCells;
    private updateCells;
    private getCandidateIds;
    private rectsIntersect;
    private distanceToRect;
}
export {};
//# sourceMappingURL=index.d.ts.map