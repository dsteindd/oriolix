export type NetworkModel = {
    id: string,
    name: string,
    description?: string,
    // inputImageWidth: number,
    // inputImageHeight: number,
    // isGrayscale: boolean,
    isPublic: boolean,
    numberOfLabels: number,
    isOwner: boolean
}

export type AddNetworkModel = {
    networkFile: File,
    labelFile: File,
    name: string,
    description?: string,
    // inputImageWidth: number,
    // inputImageHeight: number,
    // isGrayscale: boolean,
    isPublic: boolean
}

export type EditNetworkModel = {
    name: string,
    description?: string,
    // inputImageWidth: number,
    // inputImageHeight: number,
    // isGrayscale: boolean,
    isPublic: boolean
}

export type ClassificationReport = {
    id: string,
    classifierId: string,
    status: string,
    fileId: string,
    classifications: Classification[]
}

export type Classification = {
    id: string,
    fromTime: number,
    toTime: number,
    label: string,
    confidence?: number
}
