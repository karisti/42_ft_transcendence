import { Socket } from "socket.io-client";
import { Paddle } from "./paddle";
import { InputState } from "./types";
import { PlayerID } from "./player";

export function onKeyDown(event: KeyboardEvent, myPaddle: Paddle | undefined, socket: Socket): void
{
    if (event.isComposing || myPaddle === undefined)
                return;
    if (event.code === "ArrowUp" && myPaddle.PlayerInputs.up == false)
    {
        myPaddle.PlayerInputs.up = true;
        let inputState: InputState = {
            paddleVelocityVectorY: -1
        }
        socket.emit('input', inputState);
    }
    else if (event.code === "ArrowDown" && myPaddle.PlayerInputs.down == false)
    {
        myPaddle.PlayerInputs.down = true;
        let inputState: InputState = {
            paddleVelocityVectorY: 1
        }
        socket.emit('input', inputState);
    }
}

export function onKeyUp(event: KeyboardEvent, myPaddle: Paddle | undefined, socket: Socket): void
{
    if (myPaddle === undefined)
        return;
    if (event.code === "ArrowUp" && myPaddle.PlayerInputs.up == true)
    {
        myPaddle.PlayerInputs.up = false;
        let inputState: InputState = {
            paddleVelocityVectorY: 1
        }
        socket.emit('input', inputState);
    }
    else if (event.code === "ArrowDown" && myPaddle.PlayerInputs.down == true)
    {
        myPaddle.PlayerInputs.down = false;
        let inputState: InputState = {
            paddleVelocityVectorY: -1
        }
        socket.emit('input', inputState);
    }
}
