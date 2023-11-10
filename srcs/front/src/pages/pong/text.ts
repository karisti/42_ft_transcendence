import { Resolution, Position, DrawableOptions, ScaleFactors } from "./types";
import { IDrawable, IUIObject } from "./interfaces";
import { Alignment, HorizontalAnchor, VerticalAnchor } from "./alignment";
import { Transform } from "./transform";
import { centerPositionInRangeX, centerPositionInRangeY } from "./utils";
import { Fonts } from "./fonts";

export class Text implements IDrawable, IUIObject
{
    private static PrimaryFont: string = "press_start_2p";
    private static BackupFonts: string[] = [
        "monospace",
        "sans-serif"
    ];
    private isActive: boolean;
    private transform: Transform;
    private font: Fonts;
    private alignment: Alignment;
    private text: string;
    private color: string;
    private referenceFontSize: number;

    public get IsActive(): boolean {
        return this.isActive;
    }
    public set IsActive(value: boolean) {
        this.isActive = value;
    }

    public get Transform(): Transform {
        return this.transform;
    }

    public get Font(): Fonts {
        return this.font;
    }

    public get Alignment(): Alignment {
        return this.alignment;
    }
    public set Alignment(value: Alignment) {
        this.alignment = value;
    }

    public get Text(): string
    {
        return this.text;
    }
    public set Text(value: string)
    {
        this.text = value;
    }

    public get FontSize(): number {
        return this.font.FontSize;
    }
    public set FontSize(value: number) {
        this.font.FontSize = value;
    }

    public get Height(): number {
        return this.FontSize;
    }

    public get Width(): number {
        return Math.round(this.FontSize * this.Text.length);
    }

    public get HalfHeight(): number {
        return Math.round(this.Height * 0.5);
    }

    public get HalfWidth(): number {
        return Math.round(this.Width * 0.5);
    }

    public get Color(): string {
        return this.color;
    }
    public set Color(value: string) {
        this.color = value;
    }

    public get ReferenceFontSize(): number {
        return this.referenceFontSize;
    }


    constructor(alignment: Alignment, text: string, color: string, fontSize: number, options: DrawableOptions = {})
    {
        this.alignment = alignment;
        this.transform = new Transform();
        this.text = text;
        this.color = color;
        this.font = new Fonts(fontSize, Text.PrimaryFont, Text.BackupFonts);
        this.isActive = options.SetActive === undefined ? true : options.SetActive;
        this.referenceFontSize = fontSize;
    }

    private alignmentToPosition(canvas: HTMLCanvasElement): Position
    {
        let newPosition: Position = { x: 0, y: 0};
        switch (this.Alignment.Horizontal)
        {
            case HorizontalAnchor.LEFT:
                centerPositionInRangeX(newPosition, 0, Math.round(canvas.width * 0.5));
                break;
            case HorizontalAnchor.RIGHT:
                centerPositionInRangeX(newPosition, Math.round(canvas.width * 0.5), canvas.width);
                break;
            default:
                centerPositionInRangeX(newPosition, 0, canvas.width);
        }
        switch (this.Alignment.Vertical)
        {
            case VerticalAnchor.TOP:
                centerPositionInRangeY(newPosition, 0, Math.round(canvas.height * 0.25));
                break;
            case VerticalAnchor.BOTTOM:
                centerPositionInRangeY(newPosition, Math.round(canvas.height * 0.75), canvas.height);
                break;
            default:
                centerPositionInRangeY(newPosition, 0, canvas.height);
        }

        return newPosition;
    }

    public onResizeCanvas(scaleFactors: ScaleFactors, currentCanvasResolution: Resolution, prevCanvasResolution: Resolution): void
    {
        const scale = Math.min(scaleFactors.scaleX, scaleFactors.scaleY);
        this.FontSize = this.ReferenceFontSize * scale;
    }

    public draw(ctx: CanvasRenderingContext2D): void
    {
        if (this.IsActive)
        {
            this.Transform.position = this.alignmentToPosition(ctx.canvas);
            ctx.fillStyle = this.Color;
            ctx.textAlign = "center";
            ctx.font = this.Font.toString();
            ctx.fillText(this.Text, this.Transform.position.x, this.Transform.position.y);
        }
    }
}
