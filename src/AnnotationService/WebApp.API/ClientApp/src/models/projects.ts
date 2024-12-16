export type Project = {
    id: string,
    name: string,
    description?: string,
    ownerName: string,
    isOwner: boolean,
    primaryLabelSetId?: string
    secondaryLabelSetId?: string
}

export type ProjectModel = {
    name: string,
    description?: string,
    primaryLabelSetId: string,
    secondaryLabelSetId?: string
}

export type UserProject = {
    id: string,
    name: string,
    description?: string,
    type: string,
    owner: string,
    primaryLabelSetId?: string
    secondaryLabelSetId?: string
}
