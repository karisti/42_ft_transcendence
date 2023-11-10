export class PositionRatio
{
    private positionOnAxis: number;
    private pixelsInAxis: number;

    public get PositionOnAxis(): number {
        return this.positionOnAxis;
    }
    public set PositionOnAxis(value: number) {
        this.positionOnAxis = value;
    }

    public get PixelsInAxis(): number {
        return this.pixelsInAxis;
    }
    public set PixelsInAxis(value: number) {
        this.pixelsInAxis = value;
    }

    public get PositionRatio(): number {
        return this.PositionOnAxis / this.PixelsInAxis;
    }

    constructor (positionOnAxis: number, pixelsInAxis: number)
    {
        this.positionOnAxis = positionOnAxis;
        this.pixelsInAxis = pixelsInAxis;
    }

    getResizedPosition(newPixelsInAxis: number): number
    {
        return Math.round(this.PositionRatio * newPixelsInAxis);
    }
}
