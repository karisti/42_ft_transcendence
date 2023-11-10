import { DrawableOptions, Position, Resolution, ScaleFactors } from "./types";
import { IDrawable } from "./interfaces";
import { Transform } from "./transform";
import { PositionRatio } from "./position.ratio";

export class VerticalDashedLine implements IDrawable
{
    private isActive: boolean;
    private transform: Transform;
    private height: number;
    private width: number;
    private dashHeight: number;
    private color: string;
    private referenceWidth: number;
    private referenceHeight: number;
    private referenceDashHeight: number;
    private referencePositionRatioX: PositionRatio;
    private referencePositionRatioY: PositionRatio;

    public get IsActive(): boolean
    {
        return this.isActive;
    }
    public set IsActive(value: boolean)
    {
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

    public get Height(): number {
        return this.height;
    }
    public set Height(value: number) {
        this.height = value;
    }
    
    public get HalfWidth(): number {
        return Math.round(this.Width * 0.5);
    }

    public get HalfHeight(): number {
        return Math.round(this.Height * 0.5);
    }

    public get DashHeight(): number {
        return this.dashHeight;
    }
    public set DashHeight(value: number) {
        this.dashHeight = value;
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

    private get ReferenceDashHeight(): number {
        return this.referenceDashHeight;
    }

    private get ReferencePositionRatioX(): PositionRatio {
        return this.referencePositionRatioX;
    }

    private get ReferencePositionRatioY(): PositionRatio {
        return this.referencePositionRatioY;
    }

    private get DistToNextDash(): number {
        return this.DashHeight * 2;
    }


    constructor(transform: Transform, color: string, width: number, height: number, dashHeight: number, referenceResolution: Resolution, options: DrawableOptions = {})
    {
        this.transform = transform;
        this.color = color;
        this.width = width;
        this.height = height;
        this.dashHeight = dashHeight;
        this.isActive = options.SetActive === undefined ? true : options.SetActive;
        this.referenceHeight = height;
        this.referenceWidth = width;
        this.referenceDashHeight = dashHeight;
        this.referencePositionRatioX = new PositionRatio(this.Transform.position.x, referenceResolution.width);
        this.referencePositionRatioY = new PositionRatio(this.Transform.position.y, referenceResolution.height);
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
        this.Width = Math.round(this.ReferenceWidth * scaleFactors.scaleX);
        this.Height = Math.round(this.ReferenceHeight * scaleFactors.scaleY);
        this.DashHeight = Math.round(this.ReferenceDashHeight * scaleFactors.scaleY);
        this.Transform.position.x = this.ReferencePositionRatioX.getResizedPosition(currentCanvasResolution.width);
        this.Transform.position.y = this.ReferencePositionRatioY.getResizedPosition(currentCanvasResolution.height);
    }

    public draw(ctx: CanvasRenderingContext2D): void
    {
        if (this.IsActive)
        {
            let upperLeftCornerPosition = this.getUpperLeftCorner();
            for (let i = 0; i <= this.Height; i+=this.DistToNextDash)
            {
                ctx.fillStyle = this.Color;
                ctx.fillRect(upperLeftCornerPosition.x, upperLeftCornerPosition.y + i, this.Width, this.DashHeight);
            }
        }
    }
}
