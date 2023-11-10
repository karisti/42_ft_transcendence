export enum PlayerID
{
    NONE = 0,
    LEFT_PLAYER,
    RIGHT_PLAYER
}

export class Player
{
    private score: number = 0;
    private id: PlayerID;

    constructor(playerId: PlayerID)
    {
        this.id = playerId;
    }
    public get Score(): number {
        return this.score;
    }
    public set Score(value: number) {
        this.score = value;
    }
    public get ID(): PlayerID {
        return this.id;
    }
    private set ID(value: PlayerID) {
        this.id = value;
    }
}