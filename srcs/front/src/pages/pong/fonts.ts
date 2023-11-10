export class Fonts
{
    private primaryFont: string;
    private backupFonts: string[];
    private fontSize: number;
    private fontStringRight: string;

    public get PrimaryFont(): string {
        return this.primaryFont;
    }

    public get BackupFonts(): string[] {
        return this.backupFonts;
    }

    public get FontSize(): number {
        return this.fontSize;
    }
    public set FontSize(value: number) {
        this.fontSize = value;
    }

    constructor(fontSize: number, primaryFont: string, backupFonts: string[] = [])
    {
        this.primaryFont = primaryFont;
        this.backupFonts = backupFonts;
        this.fontSize = fontSize;
        this.fontStringRight = `px ${primaryFont}`;
        backupFonts.forEach((font) => {
            this.fontStringRight = this.fontStringRight.concat(`, ${font}`);
        })
    }

    toString(): string
    {
        return `${this.FontSize}${this.fontStringRight}`;
    }
}
