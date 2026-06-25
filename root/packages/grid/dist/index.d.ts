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
    /** Adds a user to the grid at the given center position. */
    addUser(userId: string, x: number, y: number): void;
    /**
     * Commits a move to (x, y). Does NOT check collision — callers
     * (User.ts) are expected to call hasUserCollision / hasElementCollision
     * beforehand and only call this once the move has been approved.
     * No-ops if the user isn't in the grid.
     */
    moveUser(userId: string, x: number, y: number): void;
    /** Removes a user from the grid entirely. No-ops if not present. */
    removeUser(userId: string): void;
    /**
     * True if a 15x15 player box centered at (x, y) would overlap any
     * OTHER user currently in the grid. `excludeUserId` is left out of
     * the check (a user never collides with themselves).
     */
    hasUserCollision(x: number, y: number, excludeUserId: string): boolean;
    /**
     * Adds an element placement to the grid.
     *
     * `instanceId` is the grid's unique key for this specific placement;
     * `templateElementId` is carried along as metadata (e.g. which
     * sprite/asset template this instance came from) and isn't used for
     * any grid logic.
     */
    addElement(instanceId: string, x: number, y: number, width: number, height: number, statics: boolean, templateElementId: string): void;
    /** Removes an element placement from the grid. No-ops if not present. */
    removeElement(instanceId: string): void;
    /**
     * True if the given top-left-anchored box overlaps any element
     * currently in the grid (static or dynamic — callers decide whether
     * dynamic elements should block movement; today everything does).
     */
    hasElementCollision(x: number, y: number, width: number, height: number): boolean;
    /**
     * Returns every user and element within `radius` pixels of (x, y).
     * Not currently called from User.ts, but kept for upcoming proximity
     * voice/video and interaction features.
     */
    getNearby(x: number, y: number, radius: number): NearbyResult;
    /** Removes every user and element, clearing the grid entirely. */
    clear(): void;
    private userCenterToBox;
    private cellKey;
    private computeOccupiedCellKeys;
    private insertIntoCells;
    private removeFromCells;
    private updateCells;
    private getCandidateIds;
    /** Standard AABB intersection. Touching edges do NOT count as overlap. */
    private rectsIntersect;
    private distanceToRect;
}
export {};
//# sourceMappingURL=index.d.ts.map