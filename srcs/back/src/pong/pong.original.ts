import { Transform } from "./transform";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Direction, GameState, InputState, Position, Resolution } from "./types";
import { centerPositionInRange } from "./utils";
import { Player, PlayerID } from "./player";
import { IPhysicsObject, IPongBackend } from "./interfaces";


export class Pong implements IPongBackend
{
    private static readonly PADDLE_MARGIN: number = 25;
    private static readonly MATCH_POINT: number = 3;
    private static readonly ReferenceResolution: Resolution = { width: 640, height: 480 };
    private gameOver: boolean = false;
    private winner: PlayerID = PlayerID.NONE;
    private leftPlayer: Player;
    private rightPlayer: Player;
    private ball: Ball = Pong.initBall();
    private leftPaddle: Paddle = Pong.initPaddle({
      x: Pong.PADDLE_MARGIN,
      y: centerPositionInRange(0, Pong.ReferenceResolution.height)
    });
    private rightPaddle: Paddle = Pong.initPaddle({
      x: Pong.ReferenceResolution.width - Pong.PADDLE_MARGIN,
      y: centerPositionInRange(0, Pong.ReferenceResolution.height)
    });
    private gameState: GameState;
    private isOriginalPong: boolean = true;
  
    constructor(leftPlayerNick: string, rightPlayerNick: string)
    {
      this.leftPlayer = new Player(PlayerID.LEFT_PLAYER, leftPlayerNick);
      this.rightPlayer = new Player(PlayerID.RIGHT_PLAYER, rightPlayerNick);
      this.gameState = this.initGameState();
    }

    private static initBall(): Ball
    {
        let position: Position = {
          x: centerPositionInRange(0, Pong.ReferenceResolution.width),
          y: centerPositionInRange(0, Pong.ReferenceResolution.height)
        }
        let transform: Transform = new Transform(position);
        let direction: Direction = {
          x: -1,
          y: 1
        }
        let color = "white";
        let speed = 1.5;
        let radius = 10;
        return new Ball(transform, color, speed, radius, direction, { SetCollider: true });
    }

    private static initPaddle(position: Position): Paddle
    {
        let transform: Transform = new Transform(position);
        let color = "black";
        let width = 10;
        let height = 100;
        let speed = 1.5;
        return new Paddle(transform, color, width, height, speed, Pong.ReferenceResolution, { SetCollider: true });
    }

    private initGameState(): GameState
    {
      let gameState: GameState = {
        ballPositionX: this.ball.Transform.position.x,
        ballPositionY: this.ball.Transform.position.y,
        evilBallPositionX: 0,
        evilBallPositionY: 0,
        leftPaddlePositionX: this.leftPaddle.Transform.position.x,
        leftPaddlePositionY: this.leftPaddle.Transform.position.y,
        rightPaddlePositionX: this.rightPaddle.Transform.position.x,
        rightPaddlePositionY: this.rightPaddle.Transform.position.y,
        leftPlayerScore: this.leftPlayer.Score,
        rightPlayerScore: this.rightPlayer.Score,
        ballReferenceSpeed: this.ball.ReferenceSpeed,
        ballVelocityVectorX: this.ball.VelocityVectorX,
        ballVelocityVectorY: this.ball.VelocityVectorY,
        evilBallReferenceSpeed: 0,
        evilBallVelocityVectorX: 0,
        evilBallVelocityVectorY: 0,
        leftPaddleReferenceSpeed: this.leftPaddle.ReferenceSpeed,
        leftPaddleVelocityVectorY: this.leftPaddle.VelocityVectorY,
        rightPaddleReferenceSpeed: this.rightPaddle.ReferenceSpeed,
        rightPaddleVelocityVectorY: this.rightPaddle.VelocityVectorY,
        gameOver: false,
        winner: PlayerID.NONE,
        referenceWidth: Pong.ReferenceResolution.width,
        referenceHeight: Pong.ReferenceResolution.height
      }
      return gameState;
    }
    
    private physicsUpdate()
    {
      // Update paddle positions based on input
      this.leftPaddle.move(Pong.ReferenceResolution);
      this.rightPaddle.move(Pong.ReferenceResolution);
  
      // Update ball position and handle collisions
      this.ball.move(Pong.ReferenceResolution, [ this.leftPaddle, this.rightPaddle ]);
    }

    private async scoreUpdate()
    {
      if (this.ball.IsInPlay)
      {
        const scorer = this.whoScored();
        if (scorer)
        {
          scorer.Score += 1;
          this.ball.IsInPlay = false;
          // 1 second pause, to give the ball time to move out of view
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.ball.IsInPlay = true;
          this.ball.resetBall(Pong.ReferenceResolution);
          if (scorer.Score === Pong.MATCH_POINT)
          {
            this.gameOver = true;
            this.winner = scorer.ID;
          }
        }
      }
    }
    
    private gameStateUpdate()
    {
      if (!this.gameState.gameOver)
      {
        this.gameState.ballPositionX = this.ball.Transform.position.x,
        this.gameState.ballPositionY = this.ball.Transform.position.y,
        this.gameState.leftPaddlePositionX = this.leftPaddle.Transform.position.x,
        this.gameState.leftPaddlePositionY = this.leftPaddle.Transform.position.y,
        this.gameState.rightPaddlePositionX = this.rightPaddle.Transform.position.x,
        this.gameState.rightPaddlePositionY = this.rightPaddle.Transform.position.y,
        this.gameState.leftPlayerScore = this.leftPlayer.Score;
        this.gameState.rightPlayerScore = this.rightPlayer.Score;
        this.gameState.ballReferenceSpeed = this.ball.ReferenceSpeed;
        this.gameState.ballVelocityVectorX = this.ball.VelocityVectorX;
        this.gameState.ballVelocityVectorY = this.ball.VelocityVectorY;
        this.gameState.leftPaddleReferenceSpeed = this.leftPaddle.ReferenceSpeed;
        this.gameState.leftPaddleVelocityVectorY = this.leftPaddle.VelocityVectorY;
        this.gameState.rightPaddleReferenceSpeed = this.rightPaddle.ReferenceSpeed;
        this.gameState.rightPaddleVelocityVectorY = this.rightPaddle.VelocityVectorY;
        this.gameState.gameOver = this.gameOver;
        this.gameState.winner = this.winner;
        this.gameState.referenceWidth = Pong.ReferenceResolution.width;
        this.gameState.referenceHeight = Pong.ReferenceResolution.height;
      }
    }

    private whoScored(): Player | null
    {
        let scorer: Player | null = null;
        let ballBoundingBox = this.ball.BoundingBoxPosition;
        if (ballBoundingBox.left < 0)
            scorer = this.rightPlayer;
        else if (ballBoundingBox.right > Pong.ReferenceResolution.width)
            scorer = this.leftPlayer;
        return scorer;
    }
    
    public applyRemoteP1Input(inputs: InputState)
    {
      console.log("Applied P1 input");
      this.leftPaddle.VelocityVectorY += inputs.paddleVelocityVectorY;
    }

    public applyRemoteP2Input(inputs: InputState)
    {
      console.log("Applied P2 input");
      this.rightPaddle.VelocityVectorY += inputs.paddleVelocityVectorY;
    }

    public getGameState(): GameState
    {
      return this.gameState;
    }

    public setGameState()
    {
      this.physicsUpdate();
      this.scoreUpdate();
      this.gameStateUpdate();
    }

    public getLeftPlayerNick(): string
    {
      return this.leftPlayer.Nick;
    }

    public getRightPlayerNick(): string
    {
      return this.rightPlayer.Nick;
    }

    public getIsOriginalPong(): boolean {
      return this.isOriginalPong;
    }
  }
