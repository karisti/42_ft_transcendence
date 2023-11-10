import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Player, PlayerID } from "./player";

export type Vector = -1 | 0 | 1;

export type Direction = { x: Vector, y: Vector };

export type Position = { x: number, y: number };

export type Resolution = { width: number, height: number }

export type BoundingBox = { top: number, bottom: number, right: number, left: number};

export type PlayerInputs = { up: boolean, down: boolean };

export type PhysicsOptions = { SetCollider?: boolean };

export type DrawableOptions = { SetActive?: boolean };

export type ScaleFactors = { scaleX: number, scaleY: number };

export type RigidBodyOptions = PhysicsOptions & DrawableOptions;

export type GameState = {
    ballPositionX: number,
    ballPositionY: number,
    evilBallPositionX: number,
    evilBallPositionY: number,
    leftPaddlePositionX: number,
    leftPaddlePositionY: number,
    rightPaddlePositionX: number,
    rightPaddlePositionY: number,
    leftPlayerScore: number,
    rightPlayerScore: number,
    ballReferenceSpeed: number,
    ballVelocityVectorX: number,
    ballVelocityVectorY: number,
    evilBallReferenceSpeed: number,
    evilBallVelocityVectorX: number,
    evilBallVelocityVectorY: number,
    leftPaddleReferenceSpeed: number,
    leftPaddleVelocityVectorY: number,
    rightPaddleReferenceSpeed: number,
    rightPaddleVelocityVectorY: number,
    gameOver: boolean,
    winner: PlayerID,
    referenceWidth: number,
    referenceHeight: number
  };

  export type InputState = {
    paddleVelocityVectorY: number,
}
