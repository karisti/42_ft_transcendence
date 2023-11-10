import { getGameCanvas, getGameRenderingContext, initGameCanvas, fetchColorConstants } from "./init";
import { GameState, Position, Resolution, ScaleFactors } from "./types";
import { IDrawable } from "./interfaces";
import { centerPositionInRange, centerPositionInRangeX, centerPositionInRangeY, getScaleFactors, showError } from "./utils";
import { Transform } from "./transform";
import { Alignment, HorizontalAnchor, VerticalAnchor } from "./alignment";
import { Text } from "./text";
import { Paddle } from "./paddle";
import { Ball } from "./ball";
import { Score } from "./score";
import { VerticalDashedLine } from "./net";
import { onKeyDown, onKeyUp } from "./input.handlers";
import { Socket, io } from "socket.io-client";
import { Player, PlayerID } from "./player";
import Pong from "./pong.original";
import PongAlt from "./pong.alt";

let canvasBackgroundColor: string;

export enum PongVariant
{
    ORIGINAL,
    ALTERNATE
}

export async function main(socket: Socket, variant: PongVariant) {
    try
    {
        await loadFont('10pt "press_start_2p"');
        const canvasElement: HTMLElement | null = document.getElementById('pong');
        const canvas = getGameCanvas(canvasElement);
        const ctx = getGameRenderingContext(canvas);
        const referenceResolution: Resolution = { width: 640, height: 480 };
        const colorConstants = await fetchColorConstants();
        canvasBackgroundColor = colorConstants.canvasBackgroundColor;
        initGameCanvas(canvas, ctx, referenceResolution, canvasBackgroundColor);
        if (variant == PongVariant.ORIGINAL)
        {
            const pong = new Pong(socket, canvas, ctx, referenceResolution, canvasBackgroundColor);
        }
        else
        {
            const pong = new PongAlt(socket, canvas, ctx, referenceResolution, canvasBackgroundColor);
        }
    }
    catch (err: any)
    {
        showError(err.message);
    }
}

async function loadFont(font: string) {
    await document.fonts.load(font);
}
