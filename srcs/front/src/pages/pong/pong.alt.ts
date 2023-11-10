import { Direction, GameState, Position, Resolution, ScaleFactors } from "./types";
import { IDrawable } from "./interfaces";
import { centerPositionInRange, centerPositionInRangeX, centerPositionInRangeY, getScaleFactors } from "./utils";
import { Transform } from "./transform";
import { Alignment, HorizontalAnchor, VerticalAnchor } from "./alignment";
import { Text } from "./text";
import { Paddle } from "./paddle";
import { Ball } from "./ball";
import { Score } from "./score";
import { VerticalDashedLine } from "./net";
import { onKeyDown, onKeyUp } from "./input.handlers";
import { Socket } from "socket.io-client";
import { PlayerID } from "./player";

class PongAlt
{
    private static PADDLE_MARGIN: number = 25;
    private static MATCH_POINT: number = 3;
    // Esto se pillará por API REST con credenciales del usuario
    private leftPlayerNick: string = "pongFu";
    // Esto se pillará por API REST con credenciales de1 usuario
    private rightPlayerNick: string = "pongAmo"
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private referenceResolution: Resolution;
    private backgroundColor: string;
    private net: VerticalDashedLine;
    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private myPaddle: Paddle | undefined;
    private ball: Ball;
    private evilBall: Ball;
    private leftScore: Score;
    private rightScore: Score;
    private gameOverText: Text;
    private drawables: IDrawable[];
    private gameState: GameState | null = null;
    private socket: Socket;

    constructor(
        socket: Socket,
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        referenceResolution: Resolution,
        backgroundColor: string)
    {
        // Connect to server
        this.socket = socket;
        /*
        socket.on('connect', () => {
            console.log('Successfully connected to the server');
        });
        */
        socket.on('player-id', (playerId) => {
            if (playerId == PlayerID.LEFT_PLAYER)
                this.myPaddle = this.leftPaddle;
            else if (playerId == PlayerID.RIGHT_PLAYER)
                this.myPaddle = this.rightPaddle;
        });
        socket.on('player_nicks', (data) => {
            this.leftScore.PlayerName = data.leftPlayerNick;
            this.rightScore.PlayerName = data.rightPlayerNick;
        });
        socket.on('gameState', (gameState: GameState) => {
            this.gameState = gameState;
            console.log(gameState.ballVelocityVectorX);
        });
        // Canvas Info
        this.canvas = canvas;
        this.ctx = context;
        this.referenceResolution = referenceResolution;
        this.backgroundColor = backgroundColor;

        // Game Object Instantiation
        this.net = this.initNet();
        this.ball = this.initBall();
        this.evilBall = this.initEvilBall();
        this.leftScore = this.initScore(HorizontalAnchor.LEFT, VerticalAnchor.TOP, this.leftPlayerNick);
        this.rightScore = this.initScore(HorizontalAnchor.RIGHT, VerticalAnchor.TOP, this.rightPlayerNick);
        this.leftPaddle = this.initPaddle({
            x: PongAlt.PADDLE_MARGIN,
            y: centerPositionInRange(0, this.canvas.height)
        });
        this.rightPaddle = this.initPaddle({
            x: this.canvas.width - PongAlt.PADDLE_MARGIN,
            y: centerPositionInRange(0, this.canvas.height)
        })
        this.gameOverText = this.initGameOverText(HorizontalAnchor.MIDDLE, VerticalAnchor.MIDDLE);

        //Input Logic (Estos escucharán por el websocket)
        document.addEventListener("keydown", (event) => {
            onKeyDown(event, this.myPaddle, this.socket);
        })
        document.addEventListener("keyup", (event) => {
            onKeyUp(event, this.myPaddle, this.socket);
        })
        
        // Render Logic
        // Leftmost objects are rendered first
        this.drawables = [ this.gameOverText, this.net, this.leftPaddle, this.rightPaddle, this.ball, this.evilBall, this.leftScore, this.rightScore ];
        this.renderFrame = this.renderFrame.bind(this);
        this.renderGameOverFrame = this.renderGameOverFrame.bind(this);
        this.resizeCanvas(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', () => {
            this.resizeCanvas(window.innerWidth, window.innerHeight);
        });

        // Attempt to connect to server
        socket.connect();
        //Game Loop
        requestAnimationFrame(this.renderFrame);
    }

    private initNet(): VerticalDashedLine
    {
        let position: Position = { x: 0, y: 0};
        centerPositionInRangeX(position, 0, this.canvas.width);
        centerPositionInRangeY(position, 0, this.canvas.height);
        let transform: Transform = new Transform(position);
        let color = "black";
        let width = 5;
        let height = this.canvas.height;
        let dashHeight = 10;
        return new VerticalDashedLine(transform, color, width, height, dashHeight, this.referenceResolution);
    }

    private initPaddle(position: Position): Paddle
    {
        let transform: Transform = new Transform(position);
        let color = "black";
        let width = 10;
        let height = 100;
        let speed = 0;
        return new Paddle(transform, color, width, height, speed, this.referenceResolution, { SetCollider: true });
    }

    private initBall(): Ball
    {
        let position: Position = {
            x: centerPositionInRange(0, this.canvas.width),
            y: centerPositionInRange(0, this.canvas.height)
        }
        let transform: Transform = new Transform(position);
        let direction: Direction = {
            x: -1,
            y: 1
          }
        let color = "white";
        let speed = 0;
        let radius = 10;
        return new Ball(transform, color, speed, radius, direction, { SetCollider: true });
    }

    private initEvilBall(): Ball
    {
        let position: Position = {
          x: centerPositionInRange(0, this.canvas.width),
          y: centerPositionInRange(0, this.canvas.height)
        }
        let transform: Transform = new Transform(position);
        let direction: Direction = {
          x: 1,
          y: -1
        }
        let color = "red";
        let speed = 0;
        let radius = 10;
        return new Ball(transform, color, speed, radius, direction, { SetCollider: true });
    }

    private initScore(horizontalAnchor: HorizontalAnchor, verticalAnchor: VerticalAnchor, playerNick: string)
    {
        let alignment: Alignment = new Alignment(horizontalAnchor, verticalAnchor);
        let color = "white";
        let fontSize = 20;
        return new Score(alignment, playerNick, color, fontSize);
    }

    private initGameOverText(horizontalAnchor: HorizontalAnchor, verticalAnchor: VerticalAnchor)
    {
        let alignment: Alignment = new Alignment(horizontalAnchor, verticalAnchor);
        let color = "white";
        let fontSize = 40;
        return new Text(alignment, "", color, fontSize, { SetActive: false });
    }

    // private isGameOver(): boolean
    // {
    //     // Additional game over logic here, such as by timeout
    //     return this.leftScore.Score == Pong.MATCH_POINT || this.rightScore.Score == Pong.MATCH_POINT;
    // }
    private isGameOver(): boolean
    {
        if (this.gameState)
        {
            return this.gameState.gameOver;
        }
        return false;
    }
    
    private whoScored(ball: Ball): Score | null
    {
        let scoreRef: Score | null = null;
        let ballBoundingBox = ball.BoundingBoxPosition;
        if (ballBoundingBox.left < 0)
        scoreRef = this.rightScore;
        else if (ballBoundingBox.right > this.canvas.width)
        scoreRef = this.leftScore;
        return scoreRef;
    }

    // private whoWon(): Score | undefined
    // {
    //     let winner: Score | undefined = undefined;
    //     if (this.leftScore.Score == Pong.MATCH_POINT)
    //         winner = this.leftScore;
    //     else if (this.rightScore.Score == Pong.MATCH_POINT)
    //         winner = this.rightScore;
    //     return winner;
    // }

    private whoWon(gameState: GameState): Score | undefined
    {
        let winner: Score | undefined = undefined;
        switch (gameState.winner)
        {
            case PlayerID.LEFT_PLAYER:
                winner = this.leftScore;
                break;
            case PlayerID.RIGHT_PLAYER:
                winner = this.rightScore;
                break;
            default:
                break;
        }
        return winner;
    }

    private clearScreen()
    {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private onGameOver(gameState: GameState)
    {
        let winner: Score | undefined = this.whoWon(gameState);            
        this.gameOverText.Text = `${ winner ? winner.PlayerName : "Nobody" } WINS`;
        this.gameOverText.IsActive = true;
        this.drawables.splice(1, this.drawables.length);
        this.socket.disconnect();
    }
    
    private physicsUpdate()
    {
        // For client-side prediction restore old physicsUpdate()...
        // this.ball.move(this.canvas, [ this.leftPaddle, this.rightPaddle ]);
        // this.leftPaddle.move(this.canvas);
        // this.rightPaddle.move(this.canvas);
    }

    private remoteUpdate()
    {
        if (this.gameState)
        {
            let currentResolution = {
                width: this.canvas.width,
                height: this.canvas.height
            }
            let referenceResolution = {
                width: this.gameState.referenceWidth,
                height: this.gameState.referenceHeight
            }
            let scaleFactors = getScaleFactors(currentResolution, referenceResolution);
            // this.ball.updateSpeed(scaleFactors, this.gameState.ballReferenceSpeed);
            // this.ball.VelocityVectorX = this.gameState.ballVelocityVectorX;
            // this.ball.VelocityVectorY = this.gameState.ballVelocityVectorY;
            // this.leftPaddle.updateSpeed(scaleFactors, this.gameState.leftPaddleReferenceSpeed);
            // this.leftPaddle.VelocityVectorY = this.gameState.leftPaddleVelocityVectorY;
            // this.rightPaddle.updateSpeed(scaleFactors, this.gameState.rightPaddleReferenceSpeed);
            // this.rightPaddle.VelocityVectorY = this.gameState.rightPaddleVelocityVectorY;
            this.leftScore.Score = this.gameState.leftPlayerScore;
            this.rightScore.Score = this.gameState.rightPlayerScore;
            this.ball.Transform.position.x = this.gameState.ballPositionX;
            this.ball.Transform.position.y = this.gameState.ballPositionY;
            this.evilBall.Transform.position.x = this.gameState.evilBallPositionX;
            this.evilBall.Transform.position.y = this.gameState.evilBallPositionY;
            this.leftPaddle.Transform.position.x = this.gameState.leftPaddlePositionX;
            this.leftPaddle.Transform.position.y = this.gameState.leftPaddlePositionY;
            this.rightPaddle.Transform.position.x = this.gameState.rightPaddlePositionX;
            this.rightPaddle.Transform.position.y = this.gameState.rightPaddlePositionY;
            this.ball.synchronizeState(this.gameState, currentResolution);
            this.evilBall.synchronizeState(this.gameState, currentResolution);
            this.leftPaddle.synchronizeState(this.gameState, currentResolution);
            this.rightPaddle.synchronizeState(this.gameState, currentResolution);
        }
    }
    
    private async scoreUpdate()
    {
        if (this.ball.IsInPlay)
        {
            let player = this.whoScored(this.ball);
            if (player)
            {
                player.Score += 1;
                this.ball.IsInPlay = false;
                // 1 second pause, to give the ball time to move out of view
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.ball.IsInPlay = true;
                let currentResolution = {
                    width: this.canvas.width,
                    height: this.canvas.height
                }
                let scaleFactors = getScaleFactors(currentResolution, this.referenceResolution);
                this.ball.updateSpeed(scaleFactors, this.ball.ReferenceSpeed + 1);
                this.ball.resetBall(this.canvas);
            }
        }
    }

    private resizeCanvas(newWindowWidth: number, newWindowHeight: number): void
    {
        // Calculate new canvas resolution, applying layout constraints
        const verticalMargin = 200;
        const availableHeight = newWindowHeight - verticalMargin;
        let newCanvasWidth = newWindowWidth * 0.7;
        let newCanvasHeight = newCanvasWidth / (this.referenceResolution.width / this.referenceResolution.height);
        if (newCanvasHeight > availableHeight)
        {
            newCanvasHeight = availableHeight;
            newCanvasWidth = newCanvasHeight * (this.referenceResolution.width / this.referenceResolution.height);
        }
        const newCanvasResolution = {
            width: Math.round(newCanvasWidth),
            height: Math.round(newCanvasHeight)
        }

        // Add minimum size constraints
        const minWidth = this.referenceResolution.width * 0.5;
        const minHeight = this.referenceResolution.height * 0.5;
        if (newCanvasWidth < minWidth || newCanvasHeight < minHeight)
        {
            // Skip resizing the canvas if below the minimum size
            return;
        }

        // Save previous canvas resolution
        const prevCanvasResolution: Resolution = {
            width: this.canvas.width,
            height: this.canvas.height
        };

        // Calculate scale factors
        const scaleFactors: ScaleFactors = getScaleFactors(newCanvasResolution, this.referenceResolution);

        // Apply new canvas resolution
        this.canvas.width = newCanvasResolution.width;
        this.canvas.height = newCanvasResolution.height;

        // Rescale all drawables on canvas
        this.drawables.forEach((drawable) => {
            drawable.onResizeCanvas(scaleFactors, newCanvasResolution, prevCanvasResolution);
        })
    }

    private renderFrame()
    {
        if (!this.isGameOver())
        {
            if (this.gameState)
            {
                // Physics update will probably need to be behind a sync check once websocket implemented
                this.remoteUpdate();
                //this.physicsUpdate();
                this.gameState = null;
                // this.scoreUpdate();
                this.clearScreen();
                this.drawables.forEach((drawable) => {
                    drawable.draw(this.ctx);
                })
            }
            requestAnimationFrame(this.renderFrame);
        }
        else
        {
            this.onGameOver(this.gameState!);
            requestAnimationFrame(this.renderGameOverFrame);
        }
    }

    private renderGameOverFrame()
    {
        this.clearScreen();
        this.drawables.forEach((drawable) => {
            drawable.draw(this.ctx);
        })
        requestAnimationFrame(this.renderGameOverFrame);
    }
}

export default PongAlt;
