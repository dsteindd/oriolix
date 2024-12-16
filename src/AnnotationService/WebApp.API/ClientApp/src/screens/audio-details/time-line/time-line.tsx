import React, {useCallback, useEffect, useRef, useState} from "react";
import Draggable from "react-draggable";

export interface Tick {
    id: string,
    xmin: number,
    xmax: number,
    tooltip?: string,
    color?: string,
    opacity?: number
}

export interface Window {
    min: number,
    max: number
}

export interface TimeLineProps {
    ticks: Tick[],
    maxTickWidth?: number,
    onClickTick?: (tick: Tick) => void,
    start?: number,
    end?: number,
    viewportWindow?: Window,
    onDrag?: (newMinTime: number, newMaxTime: number) => void,
}

export const TimeLine: React.FC<TimeLineProps> = ({
                                                      ticks,
                                                      maxTickWidth,
                                                      onClickTick,
                                                      viewportWindow,
                                                      onDrag,
                                                      start = 0,
                                                      end = 1
                                                  }) => {

    const ref = useRef<SVGElement | null>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {

        const _handleResize = () => {
            if (!!ref.current) {
                setWidth(ref.current!.clientWidth)
            }
        }
        
        if (ref.current) {
            setWidth(ref.current.clientWidth)
        }
        window.addEventListener('resize', _handleResize);
        return () => {
            window.removeEventListener('resize', _handleResize)
        }

    }, [ref.current])


    const _calculateXPixel = useCallback((time: number) => {
        return (time - start) / (end - start) * width;
    }, [start, end, width])

    const _calculatePixels = useCallback((duration: number) => {
        return duration / (end - start) * width;
    }, [start, end, width]);

    const _calculateTimeFromPixel = useCallback((pixel: number) => {
        return pixel * (end - start) / width + start;
    }, [start, end, width])


    const _renderViewport = () => {
        if (!!viewportWindow) {
            const viewportWidth = viewportWindow.max - viewportWindow.min;

            // console.log(viewportWidth)
            // console.log(_calculatePixels(viewportWidth))
            // console.log(width)
            return (
                <Draggable
                    axis="x"
                    position={{
                        x: Math.min(_calculateXPixel(viewportWindow.min), _calculateXPixel(end) - _calculatePixels(viewportWidth)),
                        y: 0
                    }}
                    onDrag={(e, {x}) => {
                        const newTime = _calculateTimeFromPixel(x);
                        const newMin = Math.max(start, Math.min(newTime, end - viewportWidth));
                        const newMax = Math.min(end, newTime + viewportWidth)


                        onDrag && onDrag(newMin, newMax)
                    }}
                    bounds={{
                        left: 0,
                        right: _calculateXPixel(end) - _calculatePixels(viewportWidth)
                    }}
                >
                    <rect
                        width={_calculatePixels(viewportWidth)}
                        height={50}
                        stroke="#000"
                        fillOpacity={0}
                    />
                </Draggable>

            )
        }
        return null;
    }

    const _getTickWidth = (t: Tick) => {

        // return 5;
        let tickWidth = 5;

        if (!!maxTickWidth) {
            tickWidth = Math.min(_calculatePixels(t.xmax - t.xmin), _calculatePixels(maxTickWidth))
        }
        return tickWidth;
    }

    const _getTickStartPosition = (t: Tick) => {
        const tickWidth = _getTickWidth(t)

        return (_calculateXPixel(t.xmax) + _calculateXPixel(t.xmin)) / 2 - tickWidth / 2
    }

    return (
        <div style={{paddingTop: 10, paddingBottom: 10}}>
            <svg width="100%" height="50" ref={(r) => ref.current = r}>

                <rect
                    width="100%"
                    height="40"
                    y={5}
                    fill="None"
                    stroke="#000"
                />

                {ticks
                    .filter(t => (t.xmax > start && t.xmin < end))
                    .map((t, index) => (
                        <rect
                            x={_getTickStartPosition(t)}
                            width={_getTickWidth(t)}
                            fillOpacity={t.opacity ?? 0.7}
                            y={5}
                            height="40"
                            fill={t.color ?? "#000"}
                            stroke="#000"
                            strokeWidth={2}
                            style={{
                                cursor: "pointer"
                            }}
                            onClick={() => onClickTick && onClickTick(t)}
                        >
                            <title>{t.tooltip ?? `Tick ${index} at ${t.xmin}s`}</title>
                        </rect>
                    ))}
                {_renderViewport()}

            </svg>
        </div>

    )
}