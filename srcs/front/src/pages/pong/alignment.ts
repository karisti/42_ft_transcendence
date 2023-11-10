export enum VerticalAnchor {
    TOP,
    MIDDLE,
    BOTTOM
}

export enum HorizontalAnchor {
    LEFT,
    MIDDLE,
    RIGHT
}

export class Alignment
{
    private horizontal: HorizontalAnchor;
    private vertical: VerticalAnchor;

    public get Horizontal(): HorizontalAnchor {
        return this.horizontal;
    }
    public set Horizontal(value: HorizontalAnchor) {
        this.horizontal = value;
    }

    public get Vertical(): VerticalAnchor {
        return this.vertical;
    }
    public set Vertical(value: VerticalAnchor) {
        this.vertical = value;
    }

    constructor(horizontalAnchor: HorizontalAnchor, verticalAnchor: VerticalAnchor)
    {
        this.horizontal = horizontalAnchor;
        this.vertical = verticalAnchor;
    }
}
