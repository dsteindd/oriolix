import {canvas} from "leaflet";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {formatFrequency, formatSeconds} from "../../../utils/formatting/string-formatting";
import {getDragModeFromMouseEvent} from "./config";
import {Drawable, Polygon} from "./drawables";
import {
    clientCoordinatesToPhysicalCoordinates as cl2p,
    DisplayDimensions,
    getUpdatedDragPanDimensions,
    PanAmount,
    physicalCoordinatesToCanvasCoordinates as p2c,
    Point
} from "./helpers";
import "./spectrogram-chart.css";
import {ITool, LassoTool, PolygonTool, RectangleTool} from "./tools";
import {MenuBar} from "../menu-bar/menu-bar";
import {wheelHandler} from "./handlers";
import {Annotation} from "../../../models/annotations";
import {SoundType} from "../../../models/bird";
import {PlaybackVerticalBar} from "./playback-vertical-bar";
import {throttle} from "lodash";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks/hooks";
import {setDisplayDimensions} from "../../../redux/slices/display-options-slice";
import {_getLabelString} from "../../../components/ui/classification-table/classification-table";
import {Tick, TimeLine} from "../time-line/time-line";
import {_padRange} from "../../../utils/layout/padding";
import {analysisDefaults} from "../../../settings/analysis-settings";
import {interpolate} from "../../../utils/interpolation";
import {Label} from "../../../models/label-set";
import {Box, Divider, Grid, ListItemIcon, ListItemText, Menu, MenuItem, Typography} from "@mui/material";
import {MdRestartAlt,} from "react-icons/md";
import {CenterFocusStrong, Crop54, Delete, Gesture, Polyline} from "@mui/icons-material";

interface SpectrogramChartProps {
    getAudioFilePath: (denoise: boolean) => string,
    getImageFilePath: (denoise: boolean, minTime?: number, maxTime?: number, minFrequency?: number, maxFrequency?: number) => string,
    duration: number,
    minFrequency: number,
    maxFrequency: number,
    initialDisplayDimensions?: DisplayDimensions,
    onPolygonAccepted: (polygon: Polygon, selectedBird: Label, selectedSoundType?: SoundType) => void,
    onAnnotationDeleted: (id: string) => void,
    initialAnnotations: Annotation[]
}

const annotationsToDrawables: (annotations: Annotation[]) => Drawable[] = (annotations) => {
    return annotations.map((annotation, index) => {
        return new Polygon(annotation.points.map(p => {
                return {
                    x: p.time,
                    y: p.frequency
                };
            }),
            annotation.primaryLabel.name,
            index % 2 == 0 ? "top" : "bottom",
            !annotation.isOwned
        )
    })
}

const annotationToDrawable: (annotation: Annotation) => Polygon = (annotation) => {
    return new Polygon(annotation.points.map(p => {
            return {
                x: p.time,
                y: p.frequency
            };
        }), 
        annotation.primaryLabel.name,
        undefined,
        annotation.isOwned
    )
}

export const SpectrogramChart: React.FC<SpectrogramChartProps> = ({
                                                                      getAudioFilePath,
                                                                      getImageFilePath,
                                                                      duration,
                                                                      minFrequency,
                                                                      maxFrequency,
                                                                      // initialDisplayDimensions,
                                                                      onPolygonAccepted,
                                                                      onAnnotationDeleted,
                                                                      initialAnnotations = []
                                                                  }) => {
    const displayOptions = useAppSelector((state) => state.displayOptions);

    const dispatch = useAppDispatch();

    // let displayDimensions = displayOptions.displayDimensions;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [image, setImage] = useState<HTMLImageElement>();


    const [playbackBar, setPlaybackBar] = useState<PlaybackVerticalBar>(new PlaybackVerticalBar(0));

    const [isDeleteMode, setIsDeleteMode] = useState(false);

    const [currentCoords, setCurrentCoords] = useState<Point>();

    const [denoise, setDenoise] = useState(false);
    const [inverted, setInverted] = useState(false);

    const timeLabelDelegate = (value: number) => formatSeconds(value)

    const frequencyLabelDelegate = (value: number) => formatFrequency(value);

    type DragState = {
        offset?: Point & DisplayDimensions,
        dragging: boolean
    }

    const [dragState, setDragState] = useState<DragState>({
        dragging: false
    })

    const [selectedBird, setSelectedBird] = useState<Label>();
    const [selectedSoundType, setSelectedSoundType] = useState<Label>();

    const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations)

    useEffect(() => {
        setAnnotations(initialAnnotations)
    }, [initialAnnotations])

    const [tool, setTool] = useState<ITool | undefined>()


    const draw = (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {

        ctx?.save();
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, Math.floor(ctx.canvas.width), Math.floor(ctx.canvas.height))
        ctx?.restore();
    }

    const [thresholds, setThresholds] = useState({
        thresholding: false,
        thresholdMin: 0,
        thresholdMax: 255,
    });

    const redraw = () => {
        if (!image || !image.src) return;

        if (thresholds.thresholding) {
            thresholdImage();
            updateDrawables();
            updatePlaybackBar();
        } else if (inverted) {
            invertImage();
            updateDrawables();
            updatePlaybackBar();
        } else {
            draw(canvasRef.current!.getContext("2d")!, image);
            updateDrawables();
            updatePlaybackBar();
        }
    }

    const physicalCoordinatesToCanvasCoordinates = (p: Point) => p2c(p, canvasRef.current!, displayOptions.displayDimensions)

    const updatePlaybackBar = () => {
        if (!playbackBar) return;

        const canvas = canvasRef.current!;

        playbackBar.draw(canvas, physicalCoordinatesToCanvasCoordinates, inverted ? "#000" : "#fff");
    }

    const updateDrawables = () => {
        const canvas = canvasRef.current!

        for (const drawable of annotationsToDrawables(initialAnnotations)) {
            drawable.draw(canvas, physicalCoordinatesToCanvasCoordinates, inverted ? '#000' : '#fff')
        }

        if (tool) {
            tool.draw(canvas, physicalCoordinatesToCanvasCoordinates, inverted ? '#000' : '#fff')
        }
    }


    useEffect(() => {
        if (!image || !image.src || !canvasRef.current) return;

        redraw()
    }, [image, displayOptions.displayDimensions, thresholds, annotations, tool, annotations.length, inverted, playbackBar])

    const clientCoordinatesToPhysicalCoordinates = (p: Point) => cl2p(p, canvasRef.current!, displayOptions.displayDimensions);

    const handleMouseClick = (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

        if (isDeleteMode) {
            for (const annotation of annotations) {
                const drawable = annotationToDrawable(annotation);
                if (drawable.isPointInside(clientCoordinatesToPhysicalCoordinates({
                    x: evt.clientX,
                    y: evt.clientY
                })) && drawable.disabled) {
                    onAnnotationDeleted(annotation.id);
                }
            }
        }

        setTool((tool) => {

            const physicalCoordinates = clientCoordinatesToPhysicalCoordinates({
                x: evt.clientX,
                y: evt.clientY
            });

            return tool?.handleMouseClick(physicalCoordinates);
        })
    }

    const handleMouseDown = (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (evt.button == 2) {
            return;
        }

        if (!tool) {
            setDragState({
                dragging: true,
                offset: {
                    x: evt.clientX,
                    y: evt.clientY,
                    minT: displayOptions.displayDimensions.minT,
                    minF: displayOptions.displayDimensions.minF,
                    maxT: displayOptions.displayDimensions.maxT,
                    maxF: displayOptions.displayDimensions.maxF
                }
            })
        } else {
            setTool((tool) => {
                return tool?.handleMouseDown(clientCoordinatesToPhysicalCoordinates({
                    x: evt.clientX,
                    y: evt.clientY
                }));
            })
        }
    }

    // const handleWheelEventAfterThrottle = (e: React.WheelEvent<HTMLCanvasElement>) => {
    //     dispatch(setDisplayDimensions(wheelHandler(e,
    //         displayOptions.displayDimensions,
    //         canvasRef.current!,
    //         duration,
    //         minFrequency,
    //         maxFrequency)))
    // }

    const handleWheelEvent = (e: React.WheelEvent<HTMLCanvasElement>) => {
        dispatch(setDisplayDimensions(wheelHandler(e,
            displayOptions.displayDimensions,
            canvasRef.current!,
            duration,
            minFrequency,
            maxFrequency)))
    };


    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        setCurrentCoords(clientCoordinatesToPhysicalCoordinates({
            x: e.clientX,
            y: e.clientY
        }));

        if (tool) {
            setTool((tool) => {
                const physicalCoordinates = clientCoordinatesToPhysicalCoordinates({
                    x: e.clientX,
                    y: e.clientY
                });

                return tool?.handleMouseMove(physicalCoordinates);
            })
        } else {
            const mode = getDragModeFromMouseEvent(e)

            if (dragState.dragging && !mode) {
                // if user stopped holding ctrl button, stop dragging
                stopDragging()
            }

            if (dragState.dragging && dragState.offset && mode) {

                const offset = dragState.offset

                let dt = e.clientX - offset.x;
                let df = e.clientY - offset.y;

                let dxp = -dt / canvasRef.current!.width * (offset.maxT - offset.minT);
                let dyp = -df / canvasRef.current!.height * (offset.maxF - offset.minF);

                const panAmount: PanAmount = {
                    dx: dxp,
                    dy: dyp
                }

                const newDisplayDimensions = getUpdatedDragPanDimensions(
                    panAmount,
                    offset,
                    duration,
                    minFrequency,
                    maxFrequency
                )
                dispatch(setDisplayDimensions(newDisplayDimensions));
            }
        }
    }

    const stopDragging = () => {
        if (!dragState.dragging) return;
        setDragState({dragging: false})
    }

    const loadImage = (denoise: boolean, displayDimensions: DisplayDimensions) => {

        const newImage = new Image();

        newImage.onload = () => {
            setImage(newImage);
        }


        newImage.src = getImageFilePath(denoise, displayDimensions.minT, displayDimensions.maxT, displayDimensions.minF, displayDimensions.maxF);
    }

    const throttledImageSetter = useCallback(throttle(loadImage, 300), [])

    useEffect(() => {
        // loadImage(denoise, displayDimensions)
        throttledImageSetter(denoise, displayOptions.displayDimensions);
    }, [denoise, displayOptions.displayDimensions])

    useEffect(() => {

        if (!canvasRef.current) return;

        canvasRef.current!.width = canvasRef.current!.clientWidth;
        canvasRef.current!.height = canvasRef.current!.clientHeight;


        const handleResize = () => {
            console.log("Handle Resize")
            if (canvasRef.current) {
                canvasRef.current.width = canvasRef.current.clientWidth;
                canvasRef.current.height = canvasRef.current.clientHeight;

                dispatch(setDisplayDimensions({...displayOptions.displayDimensions}))
            }
        }

        window.addEventListener('resize', handleResize);


        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [initialAnnotations])

    useEffect(() => {

        if (!selectedBird && !isDeleteMode) {
            setTool(undefined)
        }

        const handleKeyDownEvent = (e: KeyboardEvent) => {
            if (e.key == "z" && e.ctrlKey) {
                if (initialAnnotations.length > 0) {
                    onAnnotationDeleted && onAnnotationDeleted(initialAnnotations.at(-1)!.id)
                }
            }
            if (e.key == "d") {
                setTool(undefined)
                setIsDeleteMode(true);
            }
            if (e.key == "Escape") {
                setTool((tool) => {
                    return tool?.reset();
                })
            }
            if (e.key == "Enter") {
                acceptCurrentToolDrawable()
            }
            if (e.key == "r" && selectedBird) {
                setTool(new RectangleTool());
                setIsDeleteMode(false);
            }
            if (e.key == "m") {
                setTool(undefined);
                setIsDeleteMode(false);
            }
            if (e.key == "p" && selectedBird) {
                setTool(new PolygonTool())
                setIsDeleteMode(false);
            }
            if (e.key == "l" && selectedBird) {
                setTool(new LassoTool())
                setIsDeleteMode(false);
            }
        }

        document.addEventListener('keyup', stopAltKeyFireFox);
        document.addEventListener('keydown', handleKeyDownEvent);

        return () => {
            document.removeEventListener('keyup', stopAltKeyFireFox)
            document.removeEventListener('keydown', handleKeyDownEvent)
        }

    }, [initialAnnotations, selectedBird])

    const handleAxisReset = () => {
        dispatch(setDisplayDimensions({
            minT: 0,
            maxT: 5,
            minF: minFrequency,
            maxF: maxFrequency
        }));
    }

    const invertImage = () => {

        const canvas = canvasRef.current!;

        draw(canvas.getContext("2d")!, image!)

        const pixels = canvasRef.current!.getContext("2d")!.getImageData(
            0,
            0,
            canvas.width,
            canvas.height);

        const d = pixels.data;

        let l = d.length;
        let i = 0;

        while (i < l) {
            const v = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
            [d[i], d[i + 1], d[i + 2]] = [255 - v, 255 - v, 255 - v];
            i += 4;
        }

        canvas.getContext("2d")!.putImageData(pixels, 0, 0);
    }

    const thresholdImage = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        draw(ctx, image!)

        const pixels = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        const d = pixels.data;

        let l = d.length;
        let i = 0;

        while (i < l) {
            const v = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
            [d[i], d[i + 1], d[i + 2]] = v >= thresholds.thresholdMin && v < thresholds.thresholdMax ? [255, 255, 255] : [0, 0, 0];
            i += 4;
        }
        ctx.putImageData(pixels, 0, 0);
    }

    const handleThresholdsChanged = (thresholdMin: number, thresholdMax: number) => {
        setThresholds(thresholds => {
            return {
                ...thresholds,
                thresholdMin: thresholdMin,
                thresholdMax: thresholdMax
            }
        })
    }

    const handleMouseOut = () => {
        document.removeEventListener('wheel', stopDocumentZoom)

        stopDragging();

        setCurrentCoords(undefined);

        setTool((tool) => {
            return tool?.reset();
        })

    }

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        stopDragging();
        if (tool) {
            setTool(tool => {
                const physicalCoordinates = clientCoordinatesToPhysicalCoordinates({x: e.clientX, y: e.clientY});

                return tool?.handleMouseUp(physicalCoordinates);
            })
        }
    }

    const handleMouseOver = () => {
        document.addEventListener('wheel', stopDocumentZoom, {passive: false});
    }

    const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation();
        acceptCurrentToolDrawable()
    }

    const acceptCurrentToolDrawable = () => {
        setTool((tool) => {
            const drawable = tool?.accept();

            let polygon = drawable?.toPolygon();

            if (polygon && selectedBird) {
                onPolygonAccepted(polygon, selectedBird, selectedSoundType)
                return tool?.reset();
            } else {
                alert("Please select a bird species to annotate!")
                return tool;
            }

        })
    }

    const formatCurrentCoordinates = (p: Point) => {
        return `(t, f) = (${p.x.toFixed(2)}s, ${p.y.toFixed(3)}kHz)`
    }

    const handlePlaybackChanged = useCallback((time: number) => {
        setPlaybackBar(new PlaybackVerticalBar(time));
    }, [])

    const fileLoader = useAppSelector((state) => state.file.fileInfo)
    const annotationsLoader = useAppSelector((state) => state.file.annotations)
    const analysisLoader = useAppSelector((state) => state.analysis.analysis)

    const _getTickList: () => Tick[] = () => {
        let tickList: Tick[] = []
        if (annotationsLoader.loading == "succeeded") {
            tickList = [...annotationsLoader.data.map(a => {
                return {
                    id: a.id,
                    xmin: Math.min(...a.points.map(p => p.time)),
                    xmax: Math.max(...a.points.map(p => p.time)),
                    tooltip: `${a.primaryLabel.name} (annotated by ${a.annotatorFullName})`,
                    color: "#f00"
                }
            })];
        }
        const analysisDisplayDefaults = analysisDefaults.display;

        const _calculateOpacity = (confidence?: number) => {
            if (!confidence) return 1;

            if (confidence < analysisDisplayDefaults.minConfidence) {
                return 0;
            }

            return Math.max(0, interpolate(
                confidence,
                analysisDisplayDefaults.minConfidence,
                analysisDisplayDefaults.maxConfidence,
                analysisDisplayDefaults.minOpacity,
                analysisDisplayDefaults.maxOpacity
            ));
        }

        if (analysisLoader.loading == "succeeded") {
            tickList = tickList.concat(analysisLoader.data.classifications
                .filter(c => !c.confidence || c.confidence >= 0.5)
                .map(c => {
                    return {
                        id: c.id,
                        xmin: c.fromTime,
                        xmax: c.toTime,
                        tooltip: "Classifier: " + _getLabelString(c),
                        color: "#00f",
                        opacity: _calculateOpacity(c.confidence)
                    }
                }))
        }

        return tickList;

    }

    useEffect(() => {
        // document.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('contextmenu', handleContextMenu)
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [])


    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };


    return (
        <>

            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                        : undefined
                }
            >
                <MenuItem
                    disabled={!selectedBird}
                    onClick={() => {
                        setTool(new RectangleTool())
                        setIsDeleteMode(false)
                        handleClose();
                    }}>
                    <ListItemIcon>
                        <Crop54/>
                    </ListItemIcon>
                    <ListItemText>Bounding Box</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!selectedBird}
                    onClick={() => {
                        setTool(new LassoTool());
                        setIsDeleteMode(false);
                        handleClose();
                    }}>
                    <ListItemIcon>
                        <Gesture/>
                    </ListItemIcon>
                    <ListItemText>Shape</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!selectedBird}
                    onClick={() => {
                        setTool(new PolygonTool())
                        setIsDeleteMode(false)
                        handleClose();
                    }}>
                    <ListItemIcon>
                        <Polyline/>
                    </ListItemIcon>
                    <ListItemText>Polygon</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setTool(undefined)
                    setIsDeleteMode(false)
                    handleClose();
                }}>
                    <ListItemIcon>
                        <CenterFocusStrong/>
                    </ListItemIcon>
                    <ListItemText>Navigation</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setTool(undefined)
                    setIsDeleteMode(true)
                    handleClose();
                }}>
                    <ListItemIcon>
                        <Delete/>
                    </ListItemIcon>
                    <ListItemText>Delete Mode</ListItemText>
                </MenuItem>
                <Divider/>
                <MenuItem
                    disabled={annotations.length === 0}
                    onClick={() => {
                        if (initialAnnotations.length > 0) {
                            onAnnotationDeleted && onAnnotationDeleted(initialAnnotations.at(-1)!.id)
                        }
                        handleClose()
                    }}>
                    <ListItemIcon>
                        <MdRestartAlt/>
                    </ListItemIcon>
                    <ListItemText>Revert Last Annotation</ListItemText>
                </MenuItem>
            </Menu>

            <Grid container rowSpacing={2}>
                <Grid item xs={11}>
                    <MenuBar
                        src={getAudioFilePath(denoise)}
                        minT={displayOptions.displayDimensions.minT}
                        maxT={displayOptions.displayDimensions.maxT}
                        onPlaybackChanged={handlePlaybackChanged}
                        isDenoised={denoise}
                        onDenoiseSwitch={() => setDenoise(denoise => !denoise)}
                        isInverted={inverted}
                        onInvertSwitch={() => setInverted(inverted => !inverted)}
                        isThresholded={thresholds.thresholding}
                        onThresholdSwitch={() => setThresholds(thresholds => {
                            return {
                                ...thresholds,
                                thresholding: !thresholds.thresholding
                            }
                        })}
                        onResetAxis={handleAxisReset}
                        selectedPrimaryLabel={selectedBird}
                        onChangeSelectedPrimaryLabel={(bird) => setSelectedBird(bird)}
                        selectedSecondaryLabel={selectedSoundType}
                        onChangeSelectedSecondaryLabel={(type) => setSelectedSoundType(type)}
                        thresholdMin={thresholds.thresholdMin}
                        thresholdMax={thresholds.thresholdMax}
                        onThresholdChange={handleThresholdsChanged}
                        tool={tool}
                        isDeleteMode={isDeleteMode}
                    />
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={11}>
                    <Box
                        sx={{
                            display: "flex",
                            height: 300
                        }}
                    >
                        <canvas className="canvas-item"
                                ref={canvasRef}
                                onClick={handleMouseClick}
                                onMouseDown={handleMouseDown}
                                onWheel={handleWheelEvent}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                                onContextMenu={handleRightClick}/>
                    </Box>

                </Grid>
                <Grid item xs={1}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: 300
                    }}>
                        <Typography>
                            {frequencyLabelDelegate(displayOptions.displayDimensions.maxF)}
                        </Typography>
                        <Typography>
                            {frequencyLabelDelegate(displayOptions.displayDimensions.minF)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={11}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <Typography>
                            {timeLabelDelegate(displayOptions.displayDimensions.minT)}
                        </Typography>
                        {
                            currentCoords ?
                                <Typography>
                                    {formatCurrentCoordinates(currentCoords)}
                                </Typography>
                                : null}
                        <Typography>
                            {timeLabelDelegate(displayOptions.displayDimensions.maxT)}
                        </Typography>

                    </Box>
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={11}>
                    {
                        fileLoader.loading == "succeeded" ?
                            <>
                                <TimeLine
                                    ticks={_getTickList()}
                                    maxTickWidth={2}
                                    start={displayOptions.displayDimensions.minT}
                                    end={displayOptions.displayDimensions.maxT}
                                />
                                <TimeLine
                                    ticks={_getTickList()}
                                    start={0}
                                    end={fileLoader.data.duration}
                                    maxTickWidth={0.5}
                                    viewportWindow={
                                        {
                                            min: displayOptions.displayDimensions.minT,
                                            max: displayOptions.displayDimensions.maxT
                                        }
                                    }
                                    onDrag={(newMinTime, newMaxTime) => {
                                        dispatch(setDisplayDimensions({
                                            minT: newMinTime,
                                            maxT: newMaxTime,
                                            minF: displayOptions.displayDimensions.minF,
                                            maxF: displayOptions.displayDimensions.maxF
                                        }))
                                    }}
                                    onClickTick={(t) => {
                                        const newDims = _padRange(
                                            t.xmin,
                                            t.xmax,
                                            5
                                        );

                                        dispatch(setDisplayDimensions({
                                            minT: newDims.min,
                                            maxT: newDims.max,
                                            minF: displayOptions.displayDimensions.minF,
                                            maxF: displayOptions.displayDimensions.maxF
                                        }))
                                    }}
                                />
                            </> : null
                    }
                </Grid>
            </Grid>
        </>

    )
}

const stopDocumentZoom = (e: MouseEvent) => {
    e.preventDefault();
}

const stopAltKeyFireFox = (e: KeyboardEvent) => {
    console.log("Stop alt key")
    console.log(e)
    if (e.key == "Alt" || e.key == " ") {
        e.preventDefault();
    }
}