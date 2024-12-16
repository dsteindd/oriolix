export type AnnotationDto = {
    primaryLabelId: string,
    secondaryLabelId?: string,
    points: PolygonPoint[]
}

export type Annotation = {
    id: string,
    annotatorId: string,
    fileId: string,
    primaryLabel: AnnotationLabel,
    secondaryLabel?: AnnotationLabel,
    points: PolygonPoint[],
    createdAt: Date,
    confidence: number,
    annotatorFullName: string,
    isOwned: boolean
}

export type AnnotationLabel = {
    name: string,
    altName?: string
}

export type PolygonPoint = {
    time: number,
    frequency: number
}