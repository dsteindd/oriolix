
export const BasePath = "/api"

export const ProjectRoutes = {
    GetProjects: () => `${BasePath}/projects`,
    GetProject: (projectId: string) => `${BasePath}/projects/${projectId}`,
    GetProjectFiles: (projectId: string) => `${BasePath}/projects/${projectId}/files`,
    PostProject: () => `${BasePath}/projects`,
    EditProject: (projectId: string) => `${BasePath}/projects/${projectId}`,
    ProjectShareInfo: (id: string) => `${BasePath}/projects/${id}/shares`,
    Share: (id: string) => `${BasePath}/projects/${id}/share`,
    DeleteProject: (id: string) => `${BasePath}/projects/${id}`,
    GetProjectFileAnnotations: (projectId: string, fileId: string) =>
        `${BasePath}/projects/${projectId}/files/${fileId}/annotations`,
    DownloadProjectAnnotations: (projectId: string) => `${BasePath}/projects/${projectId}/annotations/download`,
    DownloadUserAnnotationsOfFile: (projectId: string, id: string) => `${BasePath}/projects/${projectId}/files/${id}/annotations/download`,
    GetFileById: (projectId: string, id: string) => `${BasePath}/projects/${projectId}/files/${id}`,
    UnShare: (projectId: string) => `${BasePath}/projects/${projectId}/unshare`
}


export const LabelSetRoutes = {
    GetLabelSets: () => `${BasePath}/label-sets`,
    CreateLabelSet: () => `${BasePath}/label-sets`,
    GetProjectLabels: (projectId: string) => `${BasePath}/projects/${projectId}/labels`,
    DeleteLabelSet: (labelSetId: string) => `${BasePath}/label-sets/${labelSetId}`
}

export const FileRoutes = {
    GetUserFiles: (projectId: string) => `${BasePath}/users/me/projects/${projectId}/files`,
    GetUserFileById: (projectId: string, id: string) => `${BasePath}/users/me/projects/${projectId}/files/${id}`,
    DeleteUserFileById: (id: string) => `${BasePath}/users/me/files/${id}`,
    DownloadUserFileById: (id: string, denoise?: boolean) => {
        var path = `${BasePath}/files/${id}/download`

        if (denoise == undefined) return path;

        return path + `?denoise=${denoise}`;
    },
    UserFileAmplitudesById: (id: string) => `${BasePath}/users/me/files/${id}/amplitude`,
    UserFileSpectrogramById: (id: string) => `${BasePath}/users/me/files/${id}/spectrogram`,
    PostUserFile: (projectId: string) => `${BasePath}/projects/${projectId}/files`,
    ShareFile: (id: string) => `${BasePath}/users/me/files/${id}/share`,
    UserFileShareInfo: (id: string) => `${BasePath}/users/me/files/${id}/shares`,
    GetUserSpectrogramImage: (
        id: string,
        denoise?: boolean,
        minTime?: number,
        maxTime?: number,
        minFrequency?: number,
        maxFrequency?: number
    ) => {
        var basePath = `${BasePath}/files/${id}/spectrogram/image`

        // if (denoise == undefined) return path;

        // path = path + `?denoise=${denoise}`
        const path = basePath
        
        if (denoise != undefined && minTime != undefined && maxTime != undefined && minFrequency != undefined && maxFrequency != undefined){
            return basePath + `?denoise=${denoise}&minTime=${minTime}&maxTime=${maxTime}&minFrequency=${minFrequency}&maxFrequency=${maxFrequency}`
        }
        else if (denoise != undefined){
            return basePath + `?denoise=${denoise}`
        }
        else {
            return basePath;
        }
    },

    GetFiles: () => `${BasePath}/files`,
    GetFileById: (fileId: string) => `${BasePath}/files/${fileId}`,
    DeleteFile: (id: string) => `${BasePath}/files/${id}`,
    DownloadAnnotations: () => `${BasePath}/annotations/download`,
    DownloadAnnotationsOfFile: (id: string) => `${BasePath}/files/${id}/annotations/download`,
    DownloadUserAnnotationsOfFile: (projectId: string, id: string) => `${BasePath}/users/me/projects/${projectId}/files/${id}/annotations/download`,
    DownloadUserAnnotationsOfProject: (id:string) => `${BasePath}/users/me/projects/${id}/annotations/download`,
    DownloadFile: (id: string, denoise?: boolean) => {
        const path = `${BasePath}/files/${id}/download`
        if (denoise == undefined) return path;
        return path + `?denoise=${denoise}`;
    },
    GetSpectrogramImage: (
        id: string,
        denoise?: boolean,
        minTime?: number,
        maxTime?: number,
        minFrequency?: number,
        maxFrequency?: number
    ) => {
        var basePath = `${BasePath}/files/${id}/spectrogram/image`

        // if (denoise == undefined) return path;

        // path = path + `?denoise=${denoise}`
        const path = basePath

        if (denoise != undefined && minTime != undefined && maxTime != undefined && minFrequency != undefined && maxFrequency != undefined){
            return basePath + `?denoise=${denoise}&minTime=${minTime}&maxTime=${maxTime}&minFrequency=${minFrequency}&maxFrequency=${maxFrequency}`
        }
        else if (denoise != undefined){
            return basePath + `?denoise=${denoise}`
        }
        else {
            return basePath;
        }



    },
    
    // GetSpectrogramImage: (id: string, denoise?: boolean) => {
    //     var path = `${BasePath}/files/${id}/spectrogram/image`
    //
    //     if (denoise == undefined) return path;
    //
    //     return path + `?denoise=${denoise}`;
    //
    // },
}

export const UserRoutes = {
    GetUsers: () => `${BasePath}/users`,
    GetUserById: (id: string) => `${BasePath}/users/${id}`,
    ChangeAdminStatus: (userId: string, shouldBeAdmin: boolean) => `${BasePath}/users/${userId}/roles`
}

type SearchType = "fuzzy" | "contains"

const defaultSearchType = "fuzzy";


type SearchParams = {
    page: number,
    pageSize: number,
    searchQuery: string,
    searchType: SearchType
}

const defaultSearchParams: SearchParams = {
    page: 1,
    pageSize: 10,
    searchQuery: "",
    searchType: "fuzzy"
}

export const BirdRoutes = {
    GetBirds: (queryParams: SearchParams = defaultSearchParams) => {

        const encodedParameter = Object.entries(queryParams)
            .map(kv => kv.map(encodeURIComponent).join("="))
            .join("&")

        const route = `${BasePath}/birds?` + encodedParameter;

        return route;
    },
    GetSoundTypes: () => `${BasePath}/sound-types`
}

export const AnnotationRoutes = {
    GetAnnotationsOfFile: (fileId: string, speciesId?: string, annotatorId?: string) => {

        const queryParams = {
            speciesId: speciesId,
            annotatorId: annotatorId
        }

        const encodedParameter = (Object.entries(queryParams)
            .filter(kv => typeof kv[1] === "string") as [string, string][])
            .map(kv => kv.map(encodeURIComponent).join("="))
            .join("&");

        return `${BasePath}/files/${fileId}/annotations?` + encodedParameter;
    },
    PostAnnotationOfFile: (fileId: string) => `${BasePath}/files/${fileId}/annotations`,
    GetAuthenticatedAnnotationsOfFile: (projectId: string, fileId: string) => `${BasePath}/users/me/projects/${projectId}/files/${fileId}/annotations`,
    DeleteAnnotationById: (fileId: string, annotationId: string) => `${BasePath}/files/${fileId}/annotations/${annotationId}`,
    GetFileAnnotators: (fileId: string, queryParams: SearchParams = defaultSearchParams) => {
        const encodedParameter = Object.entries(queryParams)
            .map(kv => kv.map(encodeURIComponent).join("="))
            .join("&")

        return `${BasePath}/files/${fileId}/annotations/-/annotators?` + encodedParameter;
    },
    GetFileAnnotatedBirds: (fileId: string, queryParams: SearchParams = defaultSearchParams) => {
        const encodedParameter = Object.entries(queryParams)
            .map(kv => kv.map(encodeURIComponent).join("="))
            .join("&")

        return `${BasePath}/files/${fileId}/annotations/-/species?` + encodedParameter;
    },
    ChangeConfidence: (fileId: string, annotationId: string) => `${BasePath}/files/${fileId}/annotations/${annotationId}/confidence`
}

export const NetworkRoutes = {
    GetNetwork: (id: string) => `${BasePath}/classifiers/${id}`,
    DeleteNetwork: (id: string) => `${BasePath}/classifiers/${id}`,
    GetNetworks: () => `${BasePath}/classifiers`,
    AnalyzeFile: () => `${BasePath}/classify-file`,
    EditNetwork: (modelId: string) => `${BasePath}/classifiers/${modelId}/edit`,
    AddNetwork: () => `${BasePath}/classifiers`,
    GetReportById: (reportId: string) => `${BasePath}/classifications/${reportId}`
}