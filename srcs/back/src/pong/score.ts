import { Text } from "./text";
import { Alignment } from "./alignment";
import { padEnd } from "./utils";
import { DrawableOptions } from "./types";

export class Score extends Text
{
    playerName: string;
    score: number = 0;
    
    private static get MAX_NAME_WIDTH(): number {
        return 8;
    }

    public get Score(): number {
        return this.score;
    }
    public set Score(value: number) {
        this.score = value;
        this.Text = Score.generateScoreDisplay(this.PlayerName, this.Score);
    }

    public get PlayerName(): string {
        return this.playerName;
    }
    public set PlayerName(value: string)
    {
        this.playerName = Score.formatPlayerName(value);
    }
    
    constructor(alignment: Alignment, playerName: string, color: string, fontSize: number, options: DrawableOptions = {})
    {
        playerName = Score.formatPlayerName(playerName);
        super(alignment, Score.generateScoreDisplay(playerName, 0), color, fontSize, options);
        this.playerName = playerName;
    }

    private static formatPlayerName(playerName: string)
    {
        return padEnd(playerName.slice(0, Score.MAX_NAME_WIDTH) + ":", Score.MAX_NAME_WIDTH);
    }

    private static generateScoreDisplay(playerName: string, score: number)
    {
        return `${playerName} ${score}`
    }
}
