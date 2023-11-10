import { DrawableOptions, Position, Resolution, ScaleFactors } from "./types";
import { IDrawable } from "./interfaces";
import { Transform } from "./transform";
import { PositionRatio } from "./position.ratio";

export class Rectangle implements IDrawable
{
    private isActive: boolean;
    private transform: Transform;
    private width: number;
    private height: number;
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

    public get Width(): number {
        return this.width;
    }
    public set Width(value: number) {
        this.width = value;
    }

    public get Height() : number {
        return this.height;
    }
    public set Height(value : number) {
        this.height = value;
    }

    public get HalfWidth(): number {
        return Math.round(this.Width * 0.5);
    }

    public get HalfHeight(): number {
        return Math.round(this.Height * 0.5);
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
        this.width = width;
        this.height = height;
        this.isActive = options.SetActive === undefined ? true : options.SetActive;
        this.referenceWidth = width;
        this.referenceHeight = height;
        this.referencePositionRatioX = new PositionRatio(this.Transform.position.x, referenceResolution.width);
    }

    private getUpperLeftCorner(): Position
    {
        return {
            x: this.transform.position.x - this.HalfWidth,
            y: this.transform.position.y - this.HalfHeight
        };
    }

    public onResizeCanvas(scaleFactors: ScaleFactors, currentCanvasResolution: Resolution, prevCanvasResolution: Resolution): void
    {
        this.width = Math.round(this.referenceWidth * scaleFactors.scaleX);
        this.height = Math.round(this.referenceHeight * scaleFactors.scaleY);
        const prevPositionRatioY = new PositionRatio(this.Transform.position.y, prevCanvasResolution.height);
        this.transform.position.x = this.ReferencePositionRatioX.getResizedPosition(currentCanvasResolution.width);
        this.transform.position.y = prevPositionRatioY.getResizedPosition(currentCanvasResolution.height);
    }

    public draw(ctx: CanvasRenderingContext2D): void
    {
        if (this.IsActive)
        {
            let upperLeftCornerPosition = this.getUpperLeftCorner();
            ctx.fillStyle = this.color;
            ctx.fillRect(upperLeftCornerPosition.x, upperLeftCornerPosition.y, this.Width, this.Height);
        }
    }
}
