import { Position } from "./types";

export class Transform
{
    public position: Position;
    public rotation: number;

    constructor(position: Position = { x: 0, y: 0}, rotation: number = 0)
    {
        this.position = position;
        this.rotation = rotation;
    }
}
