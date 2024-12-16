import {defaultMaxTimeRange} from "./config";

export type DisplayDimensions = {
    minT: number,
    maxT: number,
    minF: number,
    maxF: number
}


export type Point = {
    x: number,
    y: number
}

export type Key = 'ctrl' | 'shift' | 'alt';

export type Mode = 'x' | 'y' | 'xy';

export type WheelFunction = 'zoom' | 'pan'

export type PanAmount = {
    dx: number,
    dy: number
}

export type Scales = {
    xScale: number,
    yScale: number
}


export const getUpdatedDragPanDimensions = (
    panAmount: PanAmount,
    dimensions: DisplayDimensions,
    duration: number,
    minFrequency: number,
    maxFrequency: number,
    scales: Scales = {xScale: 1, yScale: 1}
) => {
    const newDisplayDimensions = {...dimensions};

    if (dimensions.minT + scales.xScale * panAmount.dx < 0) {
        // hit left bound
        newDisplayDimensions.minT = 0;
        newDisplayDimensions.maxT = dimensions.maxT - dimensions.minT;
    } else if (dimensions.maxT + scales.xScale * panAmount.dx > duration) {
        // hit right bound
        newDisplayDimensions.maxT = duration;
        newDisplayDimensions.minT = duration - (dimensions.maxT - dimensions.minT)
    } else {
        newDisplayDimensions.minT = dimensions.minT + scales.xScale * panAmount.dx;
        newDisplayDimensions.maxT = dimensions.maxT + scales.xScale * panAmount.dx;
    }

    if (dimensions.minF + scales.yScale * panAmount.dy < minFrequency) {
        // hit left bound
        newDisplayDimensions.minF = minFrequency;
        newDisplayDimensions.maxF = dimensions.maxF - dimensions.minF;
    } else if (dimensions.maxF + scales.yScale * panAmount.dy > maxFrequency) {
        // hit right bound
        newDisplayDimensions.maxF = maxFrequency;
        newDisplayDimensions.minF = maxFrequency - (dimensions.maxF - dimensions.minF)
    } else {
        newDisplayDimensions.minF = dimensions.minF + scales.yScale * panAmount.dy;
        newDisplayDimensions.maxF = dimensions.maxF + scales.yScale * panAmount.dy;
    }

    return newDisplayDimensions;
}

export const physicalCoordinatesToCanvasCoordinates: (p: Point, canvas: HTMLCanvasElement, displayDimensions: DisplayDimensions) => Point = (p, canvas, displayDimensions) => {
    const xCanvas = (p.x - displayDimensions.minT) * canvas.width / (displayDimensions.maxT - displayDimensions.minT);
    const maxMel = calculateMelScaleFrequency(displayDimensions.maxF);
    const minMel = calculateMelScaleFrequency(displayDimensions.minF);
    const m = calculateMelScaleFrequency(p.y);
    
    // const yCanvas = (p.y - displayDimensions.maxF) * canvas.height / (displayDimensions.minF - displayDimensions.maxF)
    const yCanvas = (m - maxMel)*canvas.height / (minMel - maxMel)
    
    return {
        x: Math.round(xCanvas),
        y: Math.round(yCanvas)
    }
}

export const calculateMelScaleFrequency: (freq: number) => number = (freq) => {
    return 2595*Math.log10(1 + freq/700);
}

export const calculateFrequencyFromMel: (mel: number) => number = (mel) => {
    return 700*(Math.pow(10, mel/2595) - 1);
}

export const canvasCoordinatesToPhysicalCoordinates: (p: Point, canvas: HTMLCanvasElement, displayDimensions: DisplayDimensions) => Point = (p: Point, canvas, displayDimensions) => {
    const t = displayDimensions.minT + (displayDimensions.maxT - displayDimensions.minT) * p.x / canvas.width;
    
    const m_min = calculateMelScaleFrequency(displayDimensions.minF);
    const m_max = calculateMelScaleFrequency(displayDimensions.maxF);
    
    const m = m_max + (m_min - m_max)*p.y / canvas.height;
    const f = calculateFrequencyFromMel(m);
    
    // const f = displayDimensions.maxF + (displayDimensions.minF - displayDimensions.maxF) * p.y / canvas.height

    return {x: t, y: f};
}

export const clientCoordinatesToPhysicalCoordinates: (p: Point, canvas: HTMLCanvasElement, displayDimensions: DisplayDimensions) => Point = (p, canvas, displayDimensions) => {
    return canvasCoordinatesToPhysicalCoordinates(getCanvasCoordinates(p, canvas), canvas, displayDimensions);
}


export const getUpdatedWheelPanDimensions = (
    dimensions: DisplayDimensions,
    scaleFactor: number,
    mode: Mode = 'xy',
    duration: number,
    minFrequency: number,
    maxFrequency: number
): DisplayDimensions => {

    switch (mode) {
        case 'x':
            const xPanDimensions = {...dimensions}

            const dxp = -scaleFactor * (dimensions.maxT - dimensions.minT)
            if (dimensions.minT + dxp <= 0) {
                xPanDimensions.minT = 0;
                xPanDimensions.maxT = dimensions.maxT - dimensions.minT
            } else if (dimensions.maxT + dxp >= duration) {
                xPanDimensions.minT = duration - (dimensions.maxT - dimensions.minT);
                xPanDimensions.maxT = duration;
            } else {
                xPanDimensions.minT = dimensions.minT + dxp;
                xPanDimensions.maxT = dimensions.maxT + dxp;
            }

            return xPanDimensions;
        case 'y':
            const yPanDimensions = {...dimensions}

            const dyp = +scaleFactor * (dimensions.maxF - dimensions.minF)

            if (dimensions.maxF + dyp >= maxFrequency) {
                yPanDimensions.maxF = maxFrequency;
                yPanDimensions.minF = maxFrequency - (dimensions.maxF - dimensions.minF)
            } else if (dimensions.minF + dyp <= minFrequency) {
                yPanDimensions.minF = minFrequency;
                yPanDimensions.maxF = dimensions.maxF - dimensions.minF
            } else {
                yPanDimensions.minF = dimensions.minF + dyp;
                yPanDimensions.maxF = dimensions.maxF + dyp;
            }

            return yPanDimensions
        default:
            return dimensions;
    }
}


export const getUpdatedZoomDimensions = (
    dimensions: DisplayDimensions,
    scaleFactor: number,
    fixPoint: Point,
    mode: Mode = 'xy',
    duration: number,
    minFrequency: number,
    maxFrequency: number
): DisplayDimensions => {


    let newMinX = Math.max(0, fixPoint.x + (dimensions.minT - fixPoint.x) * scaleFactor)
    let newMaxX = Math.min(duration, fixPoint.x + (dimensions.maxT - fixPoint.x) * scaleFactor)
    const newMinY = Math.max(minFrequency, fixPoint.y + (dimensions.minF - fixPoint.y) * scaleFactor);
    const newMaxY = Math.min(maxFrequency, fixPoint.y + (dimensions.maxF - fixPoint.y) * scaleFactor);

    if (newMaxX - newMinX >= defaultMaxTimeRange && newMaxX == duration) {
        newMinX = newMaxX - defaultMaxTimeRange;
    } else if (newMaxX - newMinX >= defaultMaxTimeRange && newMinX == 0) {
        newMaxX = newMinX + defaultMaxTimeRange;
    } else if (newMaxX - newMinX >= defaultMaxTimeRange) {
        // newMaxX = newMinX + defaultMaxTimeRange
        newMinX = fixPoint.x - defaultMaxTimeRange * (fixPoint.x - dimensions.minT) / (dimensions.maxT - dimensions.minT);
        newMaxX = fixPoint.x + defaultMaxTimeRange * (dimensions.maxT - fixPoint.x) / (dimensions.maxT - dimensions.minT)
    }


    switch (mode) {
        case 'xy': {
            return {
                minT: newMinX,
                maxT: newMaxX,
                minF: newMinY,
                maxF: newMaxY
            };
        }
        case 'x':
            return {
                minT: newMinX,
                maxT: newMaxX,
                minF: dimensions.minF,
                maxF: dimensions.maxF
            }
        case 'y':
            return {
                minT: dimensions.minT,
                maxT: dimensions.maxT,
                minF: newMinY,
                maxF: newMaxY
            }
    }
}

/*
    Calculates the coordinates within a canvas wrt top left corner of the canvas.
*/
export const getCanvasCoordinates = (p: Point, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: p.x - rect.left,
        y: p.y - rect.top
    }
}