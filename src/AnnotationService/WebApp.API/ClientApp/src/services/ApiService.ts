import {
    AnnotationRoutes,
    BirdRoutes,
    FileRoutes,
    LabelSetRoutes,
    NetworkRoutes,
    ProjectRoutes,
    UserRoutes
} from "./ApiConstants";
import {FileDownload, FileInfo, FileUpload} from "../models/file-info";
import {User} from "../models/user";
import {Bird} from "../models/bird";
import {Annotation, AnnotationDto} from "../models/annotations";
import {
    AddNetworkModel,
    Classification,
    ClassificationReport,
    EditNetworkModel,
    NetworkModel
} from "../models/network-models";
import {ProjectModel, Project} from "../models/projects";
import {AddLabelSetDTO, LabelSet, ProjectLabels} from "../models/label-set";

class AudioFileService {
    private static _getFileNameFromContentDispositionHeader(response: Response): string {
        const header = response.headers.get('Content-Disposition');
        const fileName = header?.split(';')[1].split('=')[1]?.replaceAll('"', '') ?? "Unspecified soundfile";

        return fileName;
    }

    async postFile(token: string, projectId: string, uploadModel: FileUpload): Promise<ErrorListResponse | void> {

        const formData = new FormData()
        formData.append(
            "file", uploadModel.content,
        )
        if (uploadModel.latitude){
            formData.append(
                "latitude",
                uploadModel.latitude!.toString()
            )
        }
        if (uploadModel.longitude){
            formData.append(
                "longitude",
                uploadModel.longitude!.toString()
            )
        }

        if (uploadModel.recordedStart) {
            const converted = new Date(uploadModel.recordedStart.toString()).toISOString();
            console.log(converted)
            formData.append(
                "startedOn",
                converted
            );
        }

        const response = await fetch(FileRoutes.PostUserFile(projectId), {
            method: 'POST',
            headers: _formatAuthHeader(token),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: formData //
        })

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }
    }

    async deleteFile(token: string | null, id: string): Promise<void> {
        await fetch(FileRoutes.DeleteFile(id), {
            method: 'DELETE',
            headers: _formatAuthHeader(token)
        })
    }

    async downloadFile(token: string | null, id: string, denoise?: boolean): Promise<FileDownload> {

        var url = FileRoutes.DownloadUserFileById(id);
        if (denoise) {
            url += new URLSearchParams([['denoise', denoise.toString()]]);
        }

        const response = await fetch(FileRoutes.DownloadUserFileById(id), {
            headers: _formatAuthHeader(token)
        });
        const fileName = AudioFileService._getFileNameFromContentDispositionHeader(response);

        return {
            content: response.blob(),
            fileName: fileName
        };
    }
}


class ProjectService {

    async getProjectFiles(token: string | null, projectId: string): Promise<FileInfo[]> {
        const response = await fetch(ProjectRoutes.GetProjectFiles(projectId), {
            headers: _formatAuthHeader(token)
        })

        const json = await response.json();

        return json;
    }


    async getProjects(token: string | null): Promise<Project[]> {

        const response = await fetch(ProjectRoutes.GetProjects(), {
            headers: _formatAuthHeader(token)
        });
        // console.log(response)
        const json = await response.json();

        return json;
    };

    async getProjectDetails(token: string | null, projectId: string): Promise<Project> {

        const response = await fetch(ProjectRoutes.GetProject(projectId), {
            headers: _formatAuthHeader(token)
        });
        // console.log(response)
        const json = await response.json();

        return json;
    };

    async deleteProject(token: string | null, id: string): Promise<void> {
        await fetch(ProjectRoutes.DeleteProject(id), {
            method: 'DELETE',
            headers: _formatAuthHeader(token)
        })
    }

    async postProject(token: string | null, projectData: ProjectModel): Promise<ErrorListResponse | void> {
        const response = await fetch(ProjectRoutes.PostProject(), {
            method: 'POST',
            headers: {
                ..._formatAuthHeader(token),
                "Content-Type": "application/json",
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(projectData) //
        });

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }
    }

    async editProject(token: string | null, projectId: string, projectData: ProjectModel): Promise<ErrorListResponse | void> {
        const response = await fetch(ProjectRoutes.EditProject(projectId), {
            method: 'PUT',
            headers: {
                ..._formatAuthHeader(token),
                "Content-Type": "application/json",
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(projectData) //
        });

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }


    }

    async downloadProjectAnnotations(token: string | null, projectId: string): Promise<{content: Promise<Blob>, fileName: string} | null> {
        const response = await fetch(ProjectRoutes.DownloadProjectAnnotations(projectId), {
            headers: _formatAuthHeader(token)
        });
        
        if (response.status === 204){
            return null
        }
        const fileName = _getFileNameFromContentDispositionHeader(response);

        return {
            content: response.blob(),
            fileName: fileName
        };
    }

    async getProjectShareInfo(token: string | null, id: string) {
        const response = await fetch(ProjectRoutes.ProjectShareInfo(id), {
            method: 'GET',
            headers: _formatAuthHeader(token)
        });

        return await response.json();
    }

    async shareProject(token: string | null, id: string, mail: string): Promise<ErrorResponse | undefined> {
        const response = await fetch(ProjectRoutes.Share(id), {
            method: 'PATCH',
            headers: {
                ..._formatAuthHeader(token),
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({mail: mail})
        })

        if (response.status >= 400 && response.status <= 499) {
            return await response.json() as ErrorResponse;
        }
        return;
    }

    async getProjectFileAnnotations(token: string | null, projectId: string, fileId: string) {
        const response = await fetch(ProjectRoutes.GetProjectFileAnnotations(projectId, fileId),
            {
                headers: _formatAuthHeader(token)
            }
        );

        return ((await response.json()) as Annotation[])
            .sort((a1, a2) => new Date(a1.createdAt).getTime() - new Date(a2.createdAt).getTime())
    }

    async downloadProjectFileAnnotations(token: string | null, projectId: string, id: string) {
        const response = await fetch(ProjectRoutes.DownloadUserAnnotationsOfFile(projectId, id), {
            headers: _formatAuthHeader(token)
        });
        const fileName = _getFileNameFromContentDispositionHeader(response);

        return {
            content: response.blob(),
            fileName: fileName
        };
    }

    async getFileInfo(token: string | null, projectId: string, fileId: string): Promise<FileInfo> {
        const response = await fetch(ProjectRoutes.GetFileById(projectId, fileId), {
            headers: _formatAuthHeader(token)
        });

        return response.json();
    }

    async unshareProject(token: string | null, id: string, userId: string) : Promise<ErrorResponse | void> {
        const response = await fetch(ProjectRoutes.UnShare(id), {
            method: 'PATCH',
            headers: {
                ..._formatAuthHeader(token),
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({userId: userId})
        })

        if (response.status >= 400 && response.status <= 499) {
            return await response.json() as ErrorResponse;
        }
        return;
    }
}

const _getFileNameFromContentDispositionHeader: (response: Response) => string = (response) => {
    const header = response.headers.get('Content-Disposition');
    const fileName = header?.split(';')[1].split('=')[1]?.replaceAll('"', '') ?? "Unspecified soundfile";

    return fileName;
}

class AdminService {


    async getUsers(token: string | null): Promise<User[]> {
        const response = await fetch(UserRoutes.GetUsers(), {
            headers: _formatAuthHeader(token)
        });
        // console.log(response)
        const json = await response.json();

        return json;
    }

    async getUserById(token: string | null, id: string): Promise<User> {
        const response = await fetch(UserRoutes.GetUserById(id), {
            headers: _formatAuthHeader(token)
        })
        const json = await response.json();
        return json;
    }

    async deleteFile(token: string | null, id: string): Promise<void> {
        await fetch(FileRoutes.DeleteFile(id), {
            method: 'DELETE',
            headers: _formatAuthHeader(token)
        })
    }

    async getFiles(token: string | null): Promise<FileInfo[]> {
        const response = await fetch(FileRoutes.GetFiles(), {
            headers: _formatAuthHeader(token)
        })

        const json = await response.json();

        return json;
    }

    async getFile(token: string | null, id: string): Promise<FileInfo> {
        const response = await fetch(FileRoutes.GetFileById(id),
            {
                headers: _formatAuthHeader(token)
            })

        return await response.json();
    }

    async downloadAnnotations(token: string) {

        const response = await fetch(FileRoutes.DownloadAnnotations(), {
            headers: _formatAuthHeader(token)
        });
        const fileName = _getFileNameFromContentDispositionHeader(response);

        return {
            content: response.blob(),
            fileName: fileName
        };
    }

    async downloadAnnotationsOfFile(token: string, id: string) {
        const response = await fetch(FileRoutes.DownloadAnnotationsOfFile(id), {
            headers: _formatAuthHeader(token)
        });
        const fileName = _getFileNameFromContentDispositionHeader(response);

        return {
            content: response.blob(),
            fileName: fileName
        };
    }

    async changeAdminUserRole(token: string | null, userId: string, shouldBeAdmin: boolean) {
        await fetch(UserRoutes.ChangeAdminStatus(userId, shouldBeAdmin), {
            method: 'PATCH',
            headers: {
                ..._formatAuthHeader(token),
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({shouldBeAdmin: shouldBeAdmin})
        })
    }
}

class AnnotationService {
    async postAnnotation(token: string | null, fileId: string, annotation: AnnotationDto): Promise<void> {
        const response = await fetch(AnnotationRoutes.PostAnnotationOfFile(fileId), {
            method: 'POST',
            headers: {
                ..._formatAuthHeader(token),
                "Content-Type": "application/json",
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(annotation) //
        })
    }

    async getAnnotationsOfFile(
        token: string | null,
        fileId: string,
        speciesId?: string,
        annotatorId?: string
    ): Promise<Annotation[]> {
        const response = await fetch(AnnotationRoutes.GetAnnotationsOfFile(fileId, speciesId, annotatorId),
            {
                headers: _formatAuthHeader(token)
            }
        )

        return response.json();
    }

    async getAnnotatorsOfFile(
        token: string | null,
        fileId: string,
        query: string = ""
    ): Promise<User[]> {
        const response = await fetch(AnnotationRoutes.GetFileAnnotators(fileId, {
                page: 1,
                pageSize: 10,
                searchQuery: query,
                searchType: "fuzzy"
            }),
            {
                headers: _formatAuthHeader(token)
            })

        return await response.json();
    }

    async getAnnotatedSpeciesOfFile(
        token: string | null,
        fileId: string,
        query: string = ""
    ): Promise<Bird[]> {
        const response = await fetch(AnnotationRoutes.GetFileAnnotatedBirds(fileId, {
                page: 1,
                pageSize: 10,
                searchQuery: query,
                searchType: "fuzzy"
            }),
            {
                headers: _formatAuthHeader(token)
            });

        return await response.json();
    }

    async getAuthenticatedAnnotationsOfFile(token: string | null, projectId: string, fileId: string): Promise<Annotation[]> {
        const response = await fetch(AnnotationRoutes.GetAuthenticatedAnnotationsOfFile(projectId, fileId),
            {
                headers: _formatAuthHeader(token)
            }
        );

        return ((await response.json()) as Annotation[])
            .sort((a1, a2) => new Date(a1.createdAt).getTime() - new Date(a2.createdAt).getTime())
    }

    async deleteAnnotationById(token: string | null, fileId: string, annotationId: string): Promise<void> {
        await fetch(AnnotationRoutes.DeleteAnnotationById(fileId, annotationId), {
            method: 'DELETE',
            headers: _formatAuthHeader(token)
        })
    }

    async changeConfidence(token: string | null, fileId: string, annotationId: string, newConfidence: number) : Promise<void> {
        await fetch(AnnotationRoutes.ChangeConfidence(fileId, annotationId), {
            method: 'PATCH',
            headers: {
                ..._formatAuthHeader(token),
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({confidence: newConfidence})
        })
    }
}


class NetworkModelService {
    async getModels(token: string | null): Promise<NetworkModel[]> {
        const response = await fetch(NetworkRoutes.GetNetworks(), {
            method: 'GET',
            headers: {
                ..._formatAuthHeader(token)
            },
        })

        return await response.json()
    }

    async addModel(token: string | null, model: AddNetworkModel): Promise<void | ErrorListResponse> {

        const formData = new FormData();

        formData.append("name", model.name);
        if (model.description) {
            formData.append("description", model.description);
        }
        formData.append("isPublic", model.isPublic!.toString());
        formData.append("networkFile", model.networkFile);
        formData.append("labelFile", model.labelFile);

        // for (const key in model){
        //     formData.append(key, model[key]);
        // }
        console.log(formData)

        const response = await fetch(NetworkRoutes.AddNetwork(), {
            method: 'POST',
            headers: _formatAuthHeader(token),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: formData //
        });

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }
    }

    async editModel(token: string | null, modelId: string, model: EditNetworkModel): Promise<void | ErrorListResponse> {
        const response = await fetch(NetworkRoutes.EditNetwork(modelId), {
            method: 'PUT',
            headers: {
                ..._formatAuthHeader(token),
                "Content-Type": "application/json",
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(model) //
        });

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }
    }

    async getModel(token: string | null, networkId: string): Promise<NetworkModel> {
        const response = await fetch(NetworkRoutes.GetNetwork(networkId), {
            method: 'GET',
            headers: {
                ..._formatAuthHeader(token)
            },
        })

        return await response.json()
    }

    async deleteModel(token: string | null, networkId: string): Promise<void> {
        await fetch(NetworkRoutes.DeleteNetwork(networkId), {
            method: 'DELETE',
            headers: {
                ..._formatAuthHeader(token)
            },
        })
    }

    async analyzeFile(token: string | null, fileId: string, networkId: string): Promise<ClassificationReport> {
        const response = await fetch(NetworkRoutes.AnalyzeFile(), {
            method: 'POST',
            headers: {
                ..._formatAuthHeader(token),
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                networkModelId: networkId,
                fileId: fileId
            })
        })

        var reportJson: ClassificationReport = await response.json();
        reportJson.classifications.sort(this._classificationCompareFunction);

        return reportJson
    }

    _classificationCompareFunction(a: Classification, b: Classification): number {
        return a.fromTime - b.fromTime;
    }


    async getReport(token: string | null, reportId: string) : Promise<ClassificationReport> {
        const response = await fetch(NetworkRoutes.GetReportById(reportId), {
            method: 'GET',
            headers: {
                ..._formatAuthHeader(token)
            },
        })
        const reportJson: ClassificationReport = await response.json();
        reportJson.classifications.sort(this._classificationCompareFunction);

        return reportJson
    }
}

class LabelSetService {
    async getLabelSets(token: string | null): Promise<LabelSet[]> {
        const response = await fetch(LabelSetRoutes.GetLabelSets(), {
            method: 'GET',
            headers: {
                ..._formatAuthHeader(token)
            },
        })

        return await response.json();
    }


    async getProjectLabels(token: string | null, projectId: string): Promise<ProjectLabels> {
        const response = await fetch(LabelSetRoutes.GetProjectLabels(projectId), {
            method: 'GET',
            headers: {
                ..._formatAuthHeader(token)
            }
        })

        return await response.json();
    }

    async createLabelSet(token: string | null, model: AddLabelSetDTO): Promise<ErrorListResponse | void> {
        const response = await fetch(LabelSetRoutes.CreateLabelSet(), {
            method: 'POST',
            headers: {
                ..._formatAuthHeader(token),
                "Content-Type": "application/json",
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(model) //
        });

        if (response.status === 400) {
            return await response.json() as ErrorListResponse;
        }
    }

    async deleteLabelSet(token: string | null, labelSetId: string): Promise<void> {
        await fetch(LabelSetRoutes.DeleteLabelSet(labelSetId), {
            method: 'DELETE',
            headers: {
                ..._formatAuthHeader(token)
            },
        })
    }
}


const _formatAuthHeader = (token: string | null): { 'Authorization'?: string } => {
    return !token ? {} : {'Authorization': `Bearer ${token}`}
}

// type SuccessResponse = {
//   status: 200 | 201
// }

type SuccessResponse<T> = {
    status: 200 | 201,
    content: T
}

export type ErrorResponse = {
    status: 400 | 404 | 409;
    detail: string;
}

export type ErrorListResponse = {
    status: 400,
    errors: string[],
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type AmplitudeResponse = {
    sampleRate: number,
    amplitudes: number[],
    dt: number,
    timeOffset: number
}

export type SpectrogramResponse = {
    dt: number,
    df: number,
    spec: number[][]
}

const fileService = new AudioFileService();
const adminService = new AdminService();
const annotationService = new AnnotationService();
const networkService = new NetworkModelService();
const projectService = new ProjectService();
const labelSetService = new LabelSetService();

export {
    fileService,
    adminService,
    annotationService,
    networkService,
    projectService,
    labelSetService
};