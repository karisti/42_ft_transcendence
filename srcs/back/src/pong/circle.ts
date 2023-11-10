import { IDrawable } from "./interfaces";
import { PositionRatio } from "./position.ratio";
import { Transform } from "./transform";
import { Resolution, DrawableOptions, ScaleFactors } from "./types";

export class Circle
{
    private isActive: boolean;
    private transform: Transform;
    private color: string;
    private referenceRadius: number;
    
    public get IsActive(): boolean {
        return this.isActive;
    }
    public set IsActive(value: boolean) {
        this.isActive = value;
    }

    public get Color(): string {
        return this.color;
    }
    public set Color(value: string) {
        //Color validation??
        this.color = value;
    }

    public get Transform(): Transform {
        return this.transform;
    }
    public set Transform(value: Transform) {
        this.transform = value;
    }

    public get Height(): number {
        return Math.round(this.ReferenceRadius * 2);
    }

    public get Width(): number {
        return Math.round(this.ReferenceRadius * 2);
    }

    public get HalfHeight(): number {
        return this.ReferenceRadius;
    }

    public get HalfWidth(): number {
        return this.ReferenceRadius;
    }

    private get ReferenceRadius(): number {
        return this.referenceRadius;
    }

    constructor(transform: Transform, color: string, radius: number, options: DrawableOptions = {} )
    {
        this.transform = transform;
        this.color = color;
        this.isActive = options.SetActive === undefined ? true : options.SetActive;
        this.referenceRadius = radius;
    }
}
