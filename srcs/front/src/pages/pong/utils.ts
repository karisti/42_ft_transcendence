import { Position, Resolution, ScaleFactors } from "./types";

const errorMessage = document.getElementById('error-message');

export function showError(message: string) {
  console.log(message);
  if (errorMessage)
  {
    errorMessage.innerHTML = message;
    errorMessage.style.display = 'block';
    console.error(message);
  }
  else
  {
    console.error('Error message element not found.');
  }
}

export function getScaleFactors(currentCanvasResolution: Resolution, referenceCanvasResolution: Resolution): ScaleFactors
{
    return {
        scaleX: currentCanvasResolution.width / referenceCanvasResolution.width,
        scaleY: currentCanvasResolution.height / referenceCanvasResolution.height
    }
}

/**
 * Normalizes a number 'x' in a range between 'min' and 'max' to a number
 * between -1 and 1.
 * @param x The number to normalize.
 * @param min The inclusive minimum.
 * @param max The inclusive maximum.
 */
export function normalizeRange(x: number, min: number, max: number): number
{
  return 2 * ((x - min) / (max - min)) - 1;
}

export function isInRange(x: number, min: number, max: number): boolean
{
  return !(x < min || x > max);
}

/**
 * Pads the end of a string up to 'maxWidth' characters. If the string is equal
 * to or longer than 'maxWidth', it is returned unaltered.
 * @param str The string to pad.
 * @param maxWidth The maximum width to pad.
 * @param padChar The padding character, 'space' by default.
 */
export function padEnd(str: string, maxWidth: number, padChar: string = ' '): string
{
  if (str.length >= maxWidth) {
    return str;
  }
  return str + padChar.repeat(maxWidth - str.length);
}

/**
 * Centers a position along the given vector.
 * @param min The lower bound of the range.
 * @param max The upper bound of the range.
 */
export function centerPositionInRange(min: number, max: number): number
{
  return Math.round((min + max) * 0.5);
}

/**
 * Centers a position along a vector on the X axis. Note, this modifies the
 * position in place.
 * @param position The position to center.
 * @param min The lower bound of the range.
 * @param max The upper bound of the range.
 */
export function centerPositionInRangeX(position: Position, min: number, max: number): void
{
  position.x = Math.round((min + max) * 0.5);
}

/**
 * Centers a position along a vector on the Y axis. Note, this modifies the
 * position in place.
 * @param position The position to center.
 * @param min The lower bound of the range.
 * @param max The upper bound of the range.
 */
export function centerPositionInRangeY(position: Position, min: number, max: number): void
{
  position.y = Math.round((min + max) * 0.5);
}
