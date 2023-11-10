import { DrawableOptions, Position, Resolution, ScaleFactors } from "./types";
import { IDrawable } from "./interfaces";
import { Transform } from "./transform";
import { PositionRatio } from "./position.ratio";

export class Rectangle
{
    private isActive: boolean;
    private transform: Transform;
    private color: string;

    private referenceWidth: number;
    private referenceHeight: number;
    private referencePositionRatioX: PositionRatio;

    public get IsActive(): boolean {
        return this.isActive;
    }
    public set IsActive(value: boolean) {
        this.isActive = value;
    }

    public get Transform(): Transform {
        return this.transform;
    }
    public set Transform(value: Transform) {
        this.transform = value;
    }

    public get HalfWidth(): number {
        return Math.round(this.ReferenceWidth * 0.5);
    }

    public get HalfHeight(): number {
        return Math.round(this.ReferenceHeight * 0.5);
    }

    public get Color(): string {
        return this.color;
    }
    public set Color(value: string) {
        this.color = value;
    }

    private get ReferenceWidth(): number {
        return this.referenceWidth;
    }

    private get ReferenceHeight(): number {
        return this.referenceHeight;
    }

    private get ReferencePositionRatioX(): PositionRatio {
        return this.referencePositionRatioX;
    }

    constructor(transform: Transform, color: string, width: number, height: number, referenceResolution: Resolution, options: DrawableOptions = {})
    {
        this.transform = transform;
        this.color = color;
        this.isActive = options.SetActive === undefined ? true : options.SetActive;
        this.referenceWidth = width;
        this.referenceHeight = height;
        this.referencePositionRatioX = new PositionRatio(this.Transform.position.x, referenceResolution.width);
    }
}
