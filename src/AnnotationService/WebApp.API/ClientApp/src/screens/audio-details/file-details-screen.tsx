import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import authService from "../../components/api-authorization/AuthorizeService";
import {annotationService} from "../../services/ApiService";
import './file-details-screen.css'
import {SpectrogramChart} from "./spectrogram-chart/spectrogram-chart";
import {Polygon} from "./spectrogram-chart/drawables";
import {AnnotationDto} from "../../models/annotations";
import {FileRoutes} from "../../services/ApiConstants";
import {UsageInfo} from "./usage-info/usage-info";
import {Box} from "@mui/material";
import {clearFile, fetchFileAnnotations, fetchFileInfoById} from "../../redux/slices/file-slice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks/hooks";
import {clearNetworks, fetchNetworks} from "../../redux/slices/network-slice";
import {clearAnalysis} from "../../redux/slices/analysis-slice";
import {
    clearDisplayOptions,
    setDisplayDimensions,
    setFollowType,
    setUserAnnotationClassification
} from "../../redux/slices/display-options-slice";
import {_padRange} from "../../utils/layout/padding";
import {Label} from "../../models/label-set";
import {AppDispatch} from "../../redux/stores/root-store";
import {UserAnnotationTable} from "./user-annotation-table/user-annotation-table";
import {getAnnotationFromTime, getAnnotationToTime} from "../../utils/annotation-helpers";

type Params = {
    projectId: string,
    id: string
}

// interface NetworkModelsState {
//     loading: boolean,
//     models?: NetworkModel[]
// }
//
// interface AnalysisState {
//     submitting: boolean,
//     report?: ClassificationReport
// }


export const FileDetails: React.FC = () => {

    const params = useParams<Params>();

    const fileLoader = useAppSelector((state) => state.file.fileInfo)
    const annotationsLoader = useAppSelector((state) => state.file.annotations)
    // const networkLoader = useAppSelector((state) => state.networks.networks)
    // const analysisLoader = useAppSelector((state) => state.analysis.analysis)
    const displayOptions = useAppSelector((state) => state.displayOptions);

    const dispatch: AppDispatch = useAppDispatch();

    const [showAll, setShowAll] = useState(true);


    useEffect(() => {
        if (!params.projectId || !params.id) return;

        dispatch(fetchFileInfoById({projectId: params.projectId, fileId: params.id}));
        dispatch(fetchFileAnnotations({projectId: params.projectId, fileId: params.id}))
        dispatch(fetchNetworks());
        return () => {
            dispatch(clearDisplayOptions())
            dispatch(clearNetworks())
            dispatch(clearFile())
            dispatch(clearAnalysis())
        }
    }, [params.id, params.projectId])

    const _renderFileInfo = (): JSX.Element => {
        if (fileLoader.loading != 'succeeded') {
            return <p><em>Loading...</em></p>
        }
        return (
            <div>
                <h1>{fileLoader.data.name}</h1>
            </div>
        )
    }

    let follow = displayOptions.follow == "UserAnnotations";
    let followClassifier = displayOptions.follow == "Classifier";

    useEffect(() => {
        if (follow && displayOptions.selectedUserAnnotation && fileLoader.loading == 'succeeded') {

            const newDims = _padRange(
                getAnnotationFromTime(displayOptions.selectedUserAnnotation),
                getAnnotationToTime(displayOptions.selectedUserAnnotation),
                2
            );

            dispatch(setDisplayDimensions({
                minF: 0,
                maxF: fileLoader.data.sampleRate / 2,
                minT: newDims.min,
                maxT: newDims.max
            }))

        }
    }, [displayOptions.selectedUserAnnotation, follow])

    // const [selectedNetworkId, setSelectedNetworkId] = useState<string | undefined>(undefined);


    useEffect(() => {
        if (followClassifier && displayOptions.selectedClassifierClassification && fileLoader.loading == 'succeeded') {

            const newDims = _padRange(
                displayOptions.selectedClassifierClassification.fromTime,
                displayOptions.selectedClassifierClassification.toTime,
                2
            );

            dispatch(setDisplayDimensions({
                minF: 0,
                maxF: fileLoader.data.sampleRate / 2,
                minT: newDims.min,
                maxT: newDims.max
            }))

            // setDisplayDimensions({
            //     minF: 0,
            //     maxF: fileLoader.data.sampleRate / 2,
            //     minT: newDims.min,
            //     maxT: newDims.max
            // })
        }
    }, [displayOptions.selectedClassifierClassification, followClassifier])

    // const _onClickAnalyze = async () => {
    //     if (fileLoader.loading == "succeeded" && !!selectedNetworkId && !!params.id) {
    //         await dispatch(analyseFile({
    //             fileId: params.id!,
    //             networkId: selectedNetworkId
    //         }))
    //     }
    // }


    const _renderSpectrogram = () => {
        if (fileLoader.loading != 'succeeded') {
            return null
        }

        const onPolygonAccepted = async (polygon: Polygon, selectedBird: Label, selectedSoundType?: Label) => {
            if (!params.id || !params.projectId) return;

            const token = await authService.getAccessToken();

            const annotation: AnnotationDto = {
                primaryLabelId: selectedBird.id,
                points: polygon.vertices.map(v => {
                    return {
                        time: v.x,
                        frequency: v.y
                    }
                }),
                secondaryLabelId: selectedSoundType?.id
            }

            await annotationService.postAnnotation(token, params.id!, annotation);

            await dispatch(fetchFileAnnotations({fileId: params.id, projectId: params.projectId}));
        }

        const onDeleteLastAnnotation = async (id: string) => {
            if (!params.id || !params.projectId) return;

            const token = await authService.getAccessToken();
            await annotationService.deleteAnnotationById(token, fileLoader.data!.id, id)
            await dispatch(fetchFileAnnotations({fileId: params.id, projectId: params.projectId}));
        }

        // const _getTickList: () => Tick[] = () => {
        //     let tickList: Tick[] = []
        //     if (annotationsLoader.loading == "succeeded") {
        //         tickList = [...annotationsLoader.data.map(a => {
        //             return {
        //                 id: a.id,
        //                 xmin: Math.min(...a.points.map(p => p.time)),
        //                 xmax: Math.max(...a.points.map(p => p.time)),
        //                 tooltip: a.primaryLabel.name,
        //                 color: "#f00"
        //             }
        //         })];
        //     }
        //     const minConfidence = 0.5
        //     const maxConfidence = 1.0
        //     const minOpacity = 0.2
        //     const maxOpacity = 1.0
        //
        //     const _calculateOpacity = (confidence?: number) => {
        //         return 1;
        //
        //         // if (!confidence) return 1;
        //         //
        //         // if (confidence < minConfidence){
        //         //     return 0;
        //         // }
        //         //
        //         // return Math.max(0, (maxOpacity - minOpacity)*(confidence - 0.5)/(maxConfidence - minConfidence) + 0.2)
        //     }
        //
        //     if (analysisLoader.loading == "succeeded") {
        //         tickList = tickList.concat(analysisLoader.data.classifications
        //             .filter(c => !c.confidence || c.confidence >= 0.5)
        //             .map(c => {
        //                 return {
        //                     id: c.id,
        //                     xmin: c.fromTime,
        //                     xmax: c.toTime,
        //                     tooltip: "Classifier: " + _getLabelString(c),
        //                     color: "#00f",
        //                     opacity: _calculateOpacity(c.confidence)
        //                 }
        //             }))
        //     }
        //     console.log(tickList)
        //
        //     return tickList;
        //
        // }

        
        return (
            fileLoader.loading != 'succeeded' || annotationsLoader.loading != 'succeeded' ? <div></div> :
                <>
                    <SpectrogramChart
                        getAudioFilePath={(denoise) => FileRoutes.DownloadUserFileById(params.id!, denoise)}
                        getImageFilePath={(denoise, minTime, maxTime, minFrequency, maxFrequency) =>
                            FileRoutes.GetUserSpectrogramImage(params.id!, denoise, minTime, maxTime, minFrequency, maxFrequency)}
                        duration={fileLoader.data.duration}
                        minFrequency={0}
                        maxFrequency={fileLoader.data.sampleRate ? fileLoader.data.sampleRate / 2 : 1}
                        initialDisplayDimensions={displayOptions.displayDimensions}
                        onPolygonAccepted={(polygon, bird, selectedSoundType) => onPolygonAccepted(polygon, bird, selectedSoundType)}
                        onAnnotationDeleted={onDeleteLastAnnotation}
                        initialAnnotations={showAll ? annotationsLoader.data : annotationsLoader.data.filter(a => a.isOwned)}
                    />
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <UserAnnotationTable
                            annotations={showAll ? annotationsLoader.data : annotationsLoader.data.filter(a => a.isOwned)}
                            follow={follow}
                            onFollowChange={(value) => {
                                if (value) {
                                    dispatch(setFollowType("UserAnnotations"));
                                } else {
                                    dispatch(setFollowType("None"))
                                }
                            }}
                            onSelectedAnnotationChange={(a) => {
                                dispatch(setUserAnnotationClassification(a))
                            }}
                            onAnnotationConfidenceChange={async (annotation, value) => {
                                const token = await authService.getAccessToken();
                                await annotationService.changeConfidence(token, params.id!, annotation.id, value)
                                await dispatch(fetchFileAnnotations({
                                    fileId: params.id!,
                                    projectId: params.projectId!
                                }))
                            }}
                            onSwitchShowAll={(value) => setShowAll(value)}
                            showAll={showAll}
                        />
                        {/*<ClassificationTable*/}
                        {/*    title={"Classifier"}*/}
                        {/*    classifications={analysisLoader.loading == "succeeded" ?*/}
                        {/*        analysisLoader.data.classifications.filter(c => !c.confidence || c.confidence >= 0.5) : []}*/}
                        {/*    follow={followClassifier}*/}
                        {/*    onFollowChange={(value) => {*/}
                        {/*        if (value) {*/}
                        {/*            dispatch(setFollowType("Classifier"));*/}
                        {/*        } else {*/}
                        {/*            dispatch(setFollowType("None"))*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    onSelectedClassificationChange={(c) => {*/}
                        {/*        dispatch(setClassifierClassification(c))*/}
                        {/*    }}*/}
                        {/*    extraToolbar={networkLoader.loading == "succeeded" ? (*/}
                        {/*        [*/}
                        {/*            <Form.Group as={Col} md="4" style={{*/}
                        {/*                marginLeft: 4,*/}
                        {/*                marginRight: 4*/}
                        {/*            }}>*/}
                        {/*                <Form.Control*/}
                        {/*                    as={"select"}*/}
                        {/*                    placeholder="Select"*/}
                        {/*                    onChange={(event) => {*/}
                        {/*                        if (networkLoader.data.map(m => m.id).includes(event.target.value)) {*/}
                        {/*                            setSelectedNetworkId(event.target.value)*/}
                        {/*                        } else {*/}
                        {/*                            setSelectedNetworkId(undefined);*/}
                        {/*                        }*/}
                        {/*                    }}*/}
                        {/*                >*/}
                        {/*                    <option value={undefined}>Select a Model</option>*/}
                        {/*                    {networkLoader.data.map(model =>*/}
                        {/*                        <option value={model.id}>{model.name}</option>)}*/}
                        {/*                </Form.Control>*/}
                        {/*            </Form.Group>,*/}
                        {/*            <IconButton disabled={*/}
                        {/*                (*/}
                        {/*                    analysisLoader.loading == "pending" ||*/}
                        {/*                    (analysisLoader.loading == "succeeded" && analysisLoader.data.status == "Pending"*/}
                        {/*                    )*/}
                        {/*                ) ||*/}
                        {/*                !selectedNetworkId}*/}
                        {/*                        onClick={_onClickAnalyze}>*/}
                        {/*                {*/}
                        {/*                    analysisLoader.loading == "succeeded" && analysisLoader.data.status == "Pending" ? */}
                        {/*                        <Box sx={{width: "100%"}}>*/}
                        {/*                            <AiFillExperiment/>*/}
                        {/*                            <LinearProgress/>*/}
                        {/*                        </Box>*/}
                        {/*                        : <AiFillExperiment/>*/}
                        {/*                }*/}
                        {/*            </IconButton>*/}
                        {/*        ]*/}
                        {/*    ) : []}*/}
                        {/*/>*/}
                    </Box>
                </>
        )
    }

    // const _annotationToClassification: (annotation: Annotation) => Classification = (annotation) => {
    //
    //     console.log(annotation)
    //     return {
    //         id: annotation.id,
    //         fromTime: Math.min(...annotation.points.map(p => p.time)),
    //         toTime: Math.max(...annotation.points.map(p => p.time)),
    //         label: annotation.primaryLabel.name,
    //         confidence: annotation.confidence
    //     }
    // }

    const fileInfoElement = _renderFileInfo();


    return (
        <div>
            {fileInfoElement}
            {_renderSpectrogram()}
            <UsageInfo/>

        </div>
    )
}