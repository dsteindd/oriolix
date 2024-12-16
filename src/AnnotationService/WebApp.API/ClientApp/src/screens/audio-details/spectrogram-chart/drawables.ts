import {Point} from "./helpers";
import pointInPolygon from 'point-in-polygon';

export interface Drawable {
    draw: (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => void
    toPolygon: () => Polygon;
    annotationText?: string;
    isPointInside: (p: Point) => boolean | undefined;
}

export type BoundingBoxProps = {
    bottom: number;
    top: number;
    left: number;
    right: number;
    annotationText?: string;
}

export class BoundingBox implements Drawable {
    bottom: number;
    top: number;
    left: number;
    right: number;
    annotationText?: string;

    constructor({bottom, top, left, right, annotationText}: BoundingBoxProps) {
        this.bottom = bottom;
        this.top = top;
        this.left = left;
        this.right = right;
        this.annotationText = annotationText;
    }

    isPointInside: (p: Point) => boolean | undefined = (p) => {
        return pointInPolygon([p.x, p.y], [
            [this.left, this.bottom],
            [this.left, this.top],
            [this.right, this.top],
            [this.right, this.bottom]
        ])
    }

    toPolygon: () => Polygon = () => {
        return new Polygon(
            [
                {
                    x: this.left, y: this.bottom
                },
                {
                    x: this.left, y: this.top
                },
                {
                    x: this.right, y: this.top
                },
                {
                    x: this.right, y: this.bottom
                }
            ]
        )
    };

    draw: (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => void = (canvas, imageCoordinatesToCanvasCoordinates, color) => {
        const ctx = canvas.getContext('2d')!


        const bottomLeft = imageCoordinatesToCanvasCoordinates({x: this.left, y: this.bottom});
        const topRight = imageCoordinatesToCanvasCoordinates({x: this.right, y: this.top})

        ctx.save()
        ctx.strokeStyle = color ?? '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(bottomLeft.x,
            bottomLeft.y,
            topRight.x - bottomLeft.x,
            topRight.y - bottomLeft.y)
        if (this.annotationText) {
            ctx.fillText(this.annotationText, topRight.x, topRight.y)
        }

        ctx.restore();
    }
}

export type AnnotationDirection = "bottom" | "top";

export class Polygon implements Drawable {
    vertices: Point[] = [];
    annotationText?: string;
    annotationDirection: AnnotationDirection;
    disabled: boolean;


    constructor(vertices: Point[], annotationText?: string, annotationDirection?: AnnotationDirection, disabled: boolean = false) {
        this.vertices = vertices;
        this.annotationText = annotationText;
        this.annotationDirection = annotationDirection ?? "top";
        this.disabled = disabled;
    }

    toPolygon: () => Polygon = () => {
        return new Polygon(this.vertices);
    };

    draw: (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => void = (canvas, imageCoordinatesToCanvasCoordinates, color) => {

        if (this.vertices.length <= 1) return;

        const canvasVertices = this.vertices.map(v => imageCoordinatesToCanvasCoordinates(v));

        const ctx = canvas.getContext('2d')!

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color ?? '#fff';
        ctx.lineWidth = 2;
        if (this.disabled){
            ctx.globalAlpha = 0.5;
        }
        
        ctx.moveTo(canvasVertices[0].x, canvasVertices[0].y);

        for (const vertex of canvasVertices) {
            ctx.lineTo(vertex.x, vertex.y);
        }

        // ctx.lineTo(this.vertices[0].x, this.vertices[0].y)
        ctx.closePath();
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.fillStyle = color ?? '#fff'

        if (this.annotationText) {
            const bbox = getBoundingBox(canvasVertices);

            if (this.annotationDirection == "top") {
                ctx.fillText(this.annotationText, bbox.left, bbox.top - 8)
            } else {
                ctx.fillText(this.annotationText, bbox.left, bbox.bottom + 24);
            }
        }

        ctx.restore();
    }

    isPointInside(p: Point): boolean | undefined {
        return pointInPolygon([p.x, p.y],
            this.vertices.map(v => [v.x, v.y]));
    }


}

const getBoundingBox = (canvasPoints: Point[]) => {
    const xValues = canvasPoints.map(v => v.x);
    const yValues = canvasPoints.map(v => v.y);

    const bottom = Math.max(...yValues);
    const top = Math.min(...yValues);
    const left = Math.min(...xValues);
    const right = Math.max(...xValues);

    return new BoundingBox({bottom: bottom, top: top, left: left, right: right})
}