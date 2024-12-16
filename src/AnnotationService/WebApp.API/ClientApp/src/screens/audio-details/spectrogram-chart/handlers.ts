import {getWheelFunctionFromWheelEvent, getZoomModeFromMouseEvent} from "./config";
import React from "react";
import {
    clientCoordinatesToPhysicalCoordinates,
    DisplayDimensions,
    getUpdatedWheelPanDimensions,
    getUpdatedZoomDimensions
} from "./helpers";


export const wheelHandler: (
    e: React.WheelEvent<HTMLCanvasElement>,
    displayDimensions: DisplayDimensions,
    canvas: HTMLCanvasElement,
    duration: number,
    minFrequency: number,
    maxFrequency: number,
    wheelScaleFactor?: number,
    dragScaleFactor?: number
) => DisplayDimensions = (
    e,
    displayDimensions,
    canvas,
    duration,
    minFrequency,
    maxFrequency,
    wheelScaleFactor = 0.99,
    dragScaleFactor = 0.01,
) => {
    const mode = getZoomModeFromMouseEvent(e)

    const wheelFunction = getWheelFunctionFromWheelEvent(e)

    const getScaleFactorFromWheelEvent = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (e.deltaY !== -0) return Math.sign(e.deltaY);
        if (e.deltaX !== -0) return Math.sign(e.deltaX)
        return 0;
    }

    switch (wheelFunction) {
        case 'zoom':
            const wheelPoint = clientCoordinatesToPhysicalCoordinates({
                x: e.clientX,
                y: e.clientY
            }, canvas, displayDimensions);
            return getUpdatedZoomDimensions(displayDimensions, Math.pow(wheelScaleFactor, -Math.sign(e.deltaY)), wheelPoint, mode, duration, minFrequency, maxFrequency)
        case 'pan':
            return getUpdatedWheelPanDimensions(displayDimensions, getScaleFactorFromWheelEvent(e) * dragScaleFactor, mode, duration, minFrequency, maxFrequency)
    }
    return displayDimensions;
}