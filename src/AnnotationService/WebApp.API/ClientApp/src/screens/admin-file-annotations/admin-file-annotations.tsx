import React, {useEffect, useState} from 'react';
import {useParams} from "react-router";
import {FileInfo} from "../../models/file-info";
import {adminService, annotationService, labelSetService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {User} from "../../models/user";
import {Annotation} from "../../models/annotations";
import {SpectrogramChart} from "../audio-details/spectrogram-chart/spectrogram-chart";
import {DisplayDimensions} from "../audio-details/spectrogram-chart/helpers";
import {FileRoutes} from "../../services/ApiConstants";
import {Label} from "../../models/label-set";
import {useProjectLabels} from "../../hooks/custom-hooks";

type AdminFileAnnotationsParams = {
    id: string,
    projectId: string
}

interface IFileInfoState {
    loading: boolean,
    info?: FileInfo
}


export const AdminFileAnnotations: React.FC<{}> = () => {
    const params = useParams<AdminFileAnnotationsParams>();
    const id = params.id!;
    const projectId = params.id!;
    
    const {primary} = useProjectLabels(projectId);

    const [fileInfo, setFileInfo] = useState<IFileInfoState>({loading: true})
    const [annotator, setAnnotator] = useState<User>();
    const [bird, setBird] = useState<Label>();
    const [displayDimensions, setDisplayDimensions] = useState<DisplayDimensions>();

    const [annotations, setAnnotations] = useState<Annotation[]>([]);


    useEffect(() => {
        _getAnnotations();


    }, [bird, annotator])


    const _getAnnotations = async () => {
        const token = await authService.getAccessToken();
        const annotations = await annotationService.getAnnotationsOfFile(
            token,
            id,
            bird?.id,
            annotator?.id
        )

        console.log(annotations)

        setAnnotations(annotations);
    }

    useEffect(() => {
        _getFileInfo();


    }, [])

    const _getFileInfo = async () => {
        const token = await authService.getAccessToken();
        const info = await adminService.getFile(token, id);
        console.log(info)

        setDisplayDimensions({
            minT: 0,
            maxT: 5,
            minF: 0,
            maxF: info.sampleRate / 2
        });

        setFileInfo({
            loading: false,
            info: info
        });


    }

    if (fileInfo.loading) {
        return (
            <p>
                Loading...
            </p>
        )
    }

    const userSearchDelegate = async (query?: string) => {
        if (!query) {
            query = ""
        }

        const token = await authService.getAccessToken();
        return await annotationService.getAnnotatorsOfFile(token, fileInfo.info!.id, query);
    };

    const birdSearchDelegate = async (query?: string) => {
        if (!query) {
            query = ""
        }

        const token = await authService.getAccessToken();
        return (await labelSetService.getProjectLabels(token, params.projectId!)).primary
        // return await annotationService.getAnnotatedSpeciesOfFile(token, fileInfo.info!.id, query);
    }

    const _onListenPlayer = (playbacktime: number) => {
        // if (_reference.current == null) return;
        //
        // (_reference.current!.scales['x'].options as CartesianScaleOptions).min = playbacktime;
        // (_reference.current!.scales['x'].options as CartesianScaleOptions).max = playbacktime + 5;
        // _reference.current!.update('none');
        //
        // console.log(displayDimensions)

        setDisplayDimensions(dimensions => ({
            minT: playbacktime,
            maxT: playbacktime + 5,
            minF: dimensions!.minF,
            maxF: dimensions!.maxF
        }))
    }

    return (
        <div>
            {/*<UserSelectionBox*/}
            {/*    selectedUser={annotator}*/}
            {/*    onSelect={(user) => setAnnotator(user)}*/}
            {/*    showDelete={true}*/}
            {/*    searchDelegate={userSearchDelegate}*/}
            {/*/>*/}
            {/*<LabelSelectionBox*/}
            {/*    selectedLabel={bird}*/}
            {/*    onSelect={(bird) => setBird(bird)}*/}
            {/*    labels={primary}*/}
            {/*/>*/}
            <SpectrogramChart
                getAudioFilePath={(denoise) => FileRoutes.DownloadFile(fileInfo.info!.id, denoise)}
                getImageFilePath={(denoise, minTime, maxTime, minFrequency, maxFrequency) =>
                    FileRoutes.GetSpectrogramImage(params.id!, denoise, minTime, maxTime, minFrequency, maxFrequency)}
                duration={fileInfo.info!.duration}
                minFrequency={0}
                maxFrequency={fileInfo.info!.sampleRate / 2}
                onPolygonAccepted={(polygon, bird) => {
                }}
                onAnnotationDeleted={(id) => {
                }}
                initialAnnotations={annotations}
                initialDisplayDimensions={displayDimensions}
            />
        </div>
    )
}

