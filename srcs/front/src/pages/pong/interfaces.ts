import { Position, BoundingBox, Resolution, ScaleFactors, GameState } from "./types";
import { Alignment } from "./alignment";
import { Transform } from "./transform";

export interface IDrawable
{
    Transform: Transform;
    IsActive: boolean;
    Height: number;
    Width: number;
    draw(ctx: CanvasRenderingContext2D): void;
    onResizeCanvas(scaleFactors: ScaleFactors, currentCanvasResolution: Resolution, prevCanvasResolution: Resolution): void;
}

export interface IPhysicsObject
{
    Transform: Transform;
    Speed: number;
    HalfHeight: number;
    HalfWidth: number;
    VelocityVectorX: number;
    VelocityVectorY: number;
    NextPosition: Position;
    move(canvas: HTMLCanvasElement, collidables: IPhysicsObject[]): void;
    IsColliderActive: boolean;
    BoundingBoxNextPosition: BoundingBox;
    BoundingBoxPosition: BoundingBox;
    willCollideCanvas(canvas: HTMLCanvasElement): boolean;
    willCollide(collidable: IPhysicsObject): boolean;
}

export interface IUIObject
{
    Alignment: Alignment;
}

export interface IStateSynchronizationObject
{
    synchronizeState(gameState: GameState, currentResolution: Resolution): void;
}
