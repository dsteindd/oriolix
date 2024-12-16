export type UserFileInfo = {
    id: string,
    projectId: string,
    name: string,
    latitude: number,
    longitude: number,
    startedOn: Date,
    uploadedOn: Date,
    numAnnotations: number,
    duration: number,
    sampleRate: number,
    type: OwnershipType,
    isPreprocessingFinished: boolean
}

export type FileInfo = {
    id: string,
    ownerId: string,
    projectId: string,
    name: string,
    latitude: number,
    longitude: number,
    startedOn: Date,
    uploadedOn: Date,
    duration: number,
    sampleRate: number,
    numAnnotations: number,
    isPreprocessingFinished: boolean
}

export enum OwnershipType {
    Shared = "Shared",
    Owned = "Owned"
}

export type FileDownload = {
    content: Promise<Blob>,
    fileName: string,
    latitude?: number,
    longitude?: number
}

export type FileUpload = {
    content: File,
    latitude?: number,
    longitude?: number,
    recordedStart?: Date
}

export type ShareInfo = {
    userId: string,
    userName: string,
    email: string
}