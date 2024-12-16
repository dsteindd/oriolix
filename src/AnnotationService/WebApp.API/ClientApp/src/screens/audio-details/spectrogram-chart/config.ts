import React from "react"
import {Key, Mode, WheelFunction} from "./helpers"

export const defaultPanZoomFraction = 0.001;
export const defaultMaxTimeRange = 60;

export const getZoomModeFromMouseEvent: (e: React.WheelEvent<HTMLCanvasElement>) => Mode = (e) => {
    if (e.deltaX !== 0) return 'x';

    if ((keyPressed(e, 'ctrl') && keyNotPressed(e, 'shift') && keyNotPressed(e, 'alt')) ||
        (keyPressed(e, 'alt') && keyNotPressed(e, 'shift') && keyNotPressed(e, 'ctrl'))) return 'x';
    if ((keyPressed(e, 'ctrl') && keyPressed(e, 'shift') && keyNotPressed(e, 'alt')) ||
        (keyPressed(e, 'alt') && keyPressed(e, 'shift') && keyNotPressed(e, 'ctrl'))) return 'y';
    return 'xy'
}


export const getDragModeFromMouseEvent: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => Mode | undefined = (e) => {
    if (keyPressed(e, 'alt') && keyNotPressed(e, 'ctrl') && keyNotPressed(e, 'shift')) return 'xy';

    return undefined;
}

export const getWheelFunctionFromWheelEvent: (e: React.WheelEvent<HTMLCanvasElement>) => WheelFunction | undefined = (e) => {
    if (e.deltaX !== 0) return 'pan';

    if ((keyPressed(e, 'ctrl') && keyNotPressed(e, 'alt')) ||
        (keyNotPressed(e, 'ctrl') && keyNotPressed(e, 'shift') && keyNotPressed(e, 'alt'))) return 'zoom';
    if (keyPressed(e, 'alt') && keyNotPressed(e, 'ctrl')) return 'pan';

    return undefined;
}

const keyPressed: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent> | React.WheelEvent<HTMLCanvasElement>, key: Key) => boolean = (e, key) => e[key + "Key"]
const keyNotPressed: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent> | React.WheelEvent<HTMLCanvasElement>, key: Key) => boolean = (e, key) => !e[key + "Key"]