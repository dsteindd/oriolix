import React, {useEffect, useState} from 'react';
import authService from '../../components/api-authorization/AuthorizeService'
import "./audio-overview.css"

import {projectService} from '../../services/ApiService';
import {useNavigate, useParams} from 'react-router';
import {FileInfo} from '../../models/file-info';
import {Button} from 'react-bootstrap';
import {AudioList} from "./audio-list/audio-list";
import {Project} from "../../models/projects";

interface IState {
    fileInfos: FileInfo[],
    loading: boolean
}

const initialState: IState = {
    fileInfos: [],
    loading: true,
}

const _fetchFileInfos = async (projectId: string): Promise<FileInfo[]> => {
    const token = await authService.getAccessToken();
    return await projectService.getProjectFiles(token!, projectId);
}

const _fetchProject = async (projectId: string): Promise<Project> => {
    const token = await authService.getAccessToken();
    return await projectService.getProjectDetails(token, projectId);
}

const FileOverview: React.FC = () => {

    const [state, setState] = useState<IState>(initialState);

    const projectId = useParams().projectId!;
    const [project, setProject] = useState<Project>();

    const _reload: (fileId: string) => void = async (fileId) => {
        const token = await authService.getAccessToken();
        const file = await projectService.getFileInfo(token, projectId, fileId);

        if (file.isPreprocessingFinished) {
            setState((prevState) => {
                const newFiles = [...prevState.fileInfos];
                const oldFileIndex = newFiles.findIndex(f => f.id == file.id);
                newFiles[oldFileIndex] = file;

                return {
                    ...prevState,
                    fileInfos: newFiles
                };
            })
        }
    }

    useEffect(() => {
        _fetchFileInfos(projectId)
            .then((fileInfos) => {
                setState({
                        loading: false,
                        fileInfos: fileInfos.sort((first, second) =>
                            new Date(second.uploadedOn).getTime() - new Date(first.uploadedOn).getTime()),
                    }
                )
            });
        _fetchProject(projectId)
            .then((project) => {
                setProject(project);
            })

    }, [projectId])

    const navigate = useNavigate();


    const _renderAddFile = () => {
        return (
            <div
                className="d-flex flex-column align-items-center">
                <p>Looks pretty plain. Try adding some files...</p>
                <Button onClick={() => navigate(`/projects/${projectId}/add-file`)}>Ok, let's add one</Button>
            </div>
        )
    }

    let contents = state.loading
        ? <p><em>Loading...</em></p>
        : state.fileInfos.length == 0 ? (
                _renderAddFile()
            ) :
            (
                <>
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="success"
                            onClick={() => navigate(`/projects/${projectId}/add-file`)}
                        >Add File</Button>
                    </div>
                    <AudioList
                        reload={_reload}
                        disableDelete={!project || !project.isOwner}
                        files={state.fileInfos}
                        handleClick={(fileId) => navigate(`/projects/${projectId}/files/${fileId}`)}
                        handleDelete={() => {
                            setState({
                                loading: true,
                                fileInfos: [],
                            })

                            _fetchFileInfos(projectId)
                                .then((fileInfos) => {
                                    setState({
                                        loading: false,
                                        fileInfos: fileInfos.sort((first, second) =>
                                            new Date(second.uploadedOn).getTime() - new Date(first.uploadedOn).getTime())
                                    })
                                });
                        }}
                    />
                </>

            )

    return (
        <div>
            {contents}
        </div>
    );
}

export default FileOverview;