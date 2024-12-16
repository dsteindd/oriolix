import {BoundingBox, Drawable, Polygon} from "./drawables";
import {Point} from "./helpers";
import React from 'react';
import {Crop54, Gesture, Polyline} from "@mui/icons-material";

export interface ITool extends Drawable {
    name: string,

    handleMouseClick: (p: Point) => ITool
    handleMouseMove: (p: Point) => ITool
    handleMouseDown: (p: Point) => ITool
    handleMouseUp: (p: Point) => ITool
    removeLastVertex: () => ITool

    // draw: (canvas: HTMLCanvasElement, dimensions: DisplayDimensions) => void;
    accept: () => Drawable | undefined

    reset: () => ITool

    renderIcon: () => JSX.Element;
}

export class PolygonTool implements ITool {
    name: string = "polygon"

    vertices: Point[] = []
    temporaryVertex?: Point;

    public constructor(vertices?: Point[], temporaryVertex?: Point) {
        this.vertices = vertices ?? [];
        this.temporaryVertex = temporaryVertex;
    }

    handleMouseDown: (p: Point) => ITool = () => this;
    handleMouseUp: (p: Point) => ITool = () => this;

    handleMouseClick: (p: Point) => ITool = (p) => {

        const newVertices = [...this.vertices];
        newVertices.push(p);

        return new PolygonTool(newVertices, this.temporaryVertex);
    };
    handleMouseMove: (p: Point) => ITool = (p) => {

        if (this.vertices.length > 0) {
            return new PolygonTool([...this.vertices], p);
        }

        return this;
    }
    removeLastVertex: () => ITool = () => {
        if (this.vertices.length === 0) return this;

        const newVertices = this.vertices.slice(0, -1)

        return new PolygonTool(newVertices, this.temporaryVertex);
    };

    draw = (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => {

        // tool should only draw something, if any number of vertices + temporary vertex; or at least two vertices and no temporary vertex
        // methods should constrain this tool to the following states
        //  - no vertices and no temporary node -> draw nothing
        //  - one vertex and no temporary node  -> draw nothing
        //  - any number of vertices >=2 and one temporary node -> draw polygon, lines from/to tmp node dashed
        //  - any number o  f vertices >=2 and no temporary node -> draw polygon, all solid

        if ((this.vertices.length === 0) ||
            (this.vertices.length === 1 && !this.temporaryVertex)) return;

        const canvasVertices = this.vertices.map(v => imageCoordinatesToCanvasCoordinates(v));


        const ctx = canvas.getContext('2d')!

        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = color ?? '#fff'
        ctx.lineWidth = 2;
        ctx.moveTo(canvasVertices[0].x, canvasVertices[0].y);

        for (var vertex of canvasVertices) {
            ctx.lineTo(vertex.x, vertex.y);
        }
        ctx.stroke();

        // only draw 
        if (this.temporaryVertex) {
            const tmpCanvasVertex = imageCoordinatesToCanvasCoordinates(this.temporaryVertex);

            ctx.setLineDash([5, 20])
            ctx.lineTo(tmpCanvasVertex.x, tmpCanvasVertex.y);
            ctx.lineTo(canvasVertices[0].x, canvasVertices[0].y)
            ctx.stroke();
        }

        ctx.restore();
    }

    accept: () => Drawable | undefined = () => {
        // accept should create the drawable and clean this tool
        if (this.vertices.length >= 3) {
            // this.vertices = []
            // this.temporaryVertex = undefined;

            return new Polygon([...this.vertices]);
        }

        return undefined;
    };

    reset: () => ITool = () => {
        return new PolygonTool();
    };

    renderIcon = () => {
        return (
            <Polyline/>
        )
    }

    toPolygon(): Polygon {
        return new Polygon(this.vertices);
    }

    isPointInside(): boolean | undefined {
        return undefined;
    }
}

export class RectangleTool implements ITool {

    name: string = "rectangle";

    vertices: Point[] = []
    temporaryVertex?: Point;


    public constructor(vertices?: Point[], temporaryVertex?: Point) {
        this.vertices = vertices ?? [];
        this.temporaryVertex = temporaryVertex;
    }

    toPolygon: () => Polygon = () => new Polygon(this.vertices);
    handleMouseDown: (p: Point) => ITool = () => this;
    handleMouseUp: (p: Point) => ITool = () => this;

    handleMouseClick: (p: Point) => ITool = (p) => {
        if (this.vertices.length <= 1) {
            const newVertices = [...this.vertices];
            newVertices.push(p);

            return new RectangleTool(newVertices, this.temporaryVertex);
        }
        // else if (this.vertices.length == 1) {
        //     const newVertices = [...this.vertices];
        //     newVertices.push(p);
        //     return new RectangleTool(newVertices, undefined);
        // }
        return this;

    };
    handleMouseMove: (p: Point) => ITool = (p) => {
        // if (this.vertices.length == 1) {
        if (this.vertices.length > 0) {
            return new RectangleTool([...this.vertices], p)
        }
        return this;
        // }
        // return this;
    }
    removeLastVertex: () => ITool = () => {
        if (this.vertices.length === 0) return this;

        const newVertices = this.vertices.slice(0, -1)

        return new RectangleTool(newVertices, this.temporaryVertex)
    };

    draw = (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => {

        // tool should only draw something, if one vertex + temporary vertex; or two vertices and no temporary vertex
        // methods should constrain this tool to the following states
        //  - no vertices and no temporary node -> draw nothing
        //  - one vertex and no temporary node  -> draw nothing
        //  - one vertex and one temporary node -> draw rect
        //  - two vertices and no temporary node -> draw rect
        //  - two vertices and one temporary node -> draw rect


        if ((this.vertices.length === 0) || (this.vertices.length === 1 && !this.temporaryVertex)) return;

        // only draw 
        const ctx = canvas.getContext('2d')!;

        let p1 = this.vertices[0];
        let p2 = this.vertices.length === 2 ? this.vertices[1] : this.temporaryVertex!;

        p1 = imageCoordinatesToCanvasCoordinates(p1);
        p2 = imageCoordinatesToCanvasCoordinates(p2);

        const left = Math.min(p1.x, p2.x)
        const right = Math.max(p1.x, p2.x)
        const top = Math.max(p1.y, p2.y)
        const bottom = Math.min(p1.y, p2.y)

        ctx.save()
        ctx.setLineDash([5, 15])
        ctx.strokeStyle = color ?? '#fff'
        ctx.lineWidth = 2;
        ctx.strokeRect(left,
            bottom,
            right - left,
            top - bottom)
        ctx.restore();
    }

    accept: () => Drawable | undefined = () => {
        // accept should create the drawable and clean this tool
        if (this.vertices.length === 2) {
            const p1 = this.vertices[0];
            const p2 = this.vertices[1];

            const left = Math.min(p1.x, p2.x)
            const right = Math.max(p1.x, p2.x)
            const top = Math.max(p1.y, p2.y)
            const bottom = Math.min(p1.y, p2.y)

            // this.vertices = [];
            // this.temporaryVertex = undefined;

            return new BoundingBox({
                left: left,
                right: right,
                bottom: bottom,
                top: top
            });
        }

        return undefined;
    };

    reset: () => ITool = () => {
        return new RectangleTool();
    }

    renderIcon = () => {
        return <Crop54/>
    }

    isPointInside(): boolean | undefined {
        return undefined;
    }
}


export class LassoTool implements ITool {
    vertices: Point[] = []
    temporaryVertex?: Point
    isMouseDown: boolean = false;
    name: string = "lasso";

    public constructor(
        vertices: Point[] = [],
        temporaryVertex: Point | undefined = undefined,
        isMouseDown: boolean = false
    ) {
        this.vertices = vertices;
        this.temporaryVertex = temporaryVertex;
        this.isMouseDown = isMouseDown
    }

    handleMouseDown: (p: Point) => ITool = (p) => {
        const newVertices = [...this.vertices];
        newVertices.push(p);
        return new LassoTool(newVertices, undefined, true)
    };

    handleMouseUp: (p: Point) => ITool = (p) => {
        return new LassoTool(this.vertices, p, false)
    };

    handleMouseClick: (p: Point) => ITool = () => {
        return this;

    };
    handleMouseMove: (p: Point) => ITool = (p) => {
        if (this.isMouseDown) {
            const newVertices = [...this.vertices];
            newVertices.push(p);
            return new LassoTool(newVertices, undefined, true);
        } else if (!this.isMouseDown && (this.vertices.length !== 0)) {
            return new LassoTool(this.vertices, p, false)
        }
        return this;
    };
    removeLastVertex: () => ITool = () => {
        if (this.vertices.length !== 0) {
            const newVertices = this.vertices.slice(0, -1);
            return new LassoTool(newVertices);
        }

        return this;
    };
    accept: () => Drawable | undefined = () => {
        if (this.vertices.length <= 3) {
            return undefined;
        }
        return new Polygon(this.vertices);

    };
    reset: () => ITool = () => {
        return new LassoTool();
    };
    draw: (canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color?: string) => void = (canvas, imageCoordinatesToCanvasCoordinates, color) => {
        if ((this.vertices.length == 0) || (this.vertices.length == 1 && !this.temporaryVertex)) return;

        const canvasVertices = this.vertices.map(v => imageCoordinatesToCanvasCoordinates(v));

        const ctx = canvas.getContext('2d')!

        ctx.save();

        ctx.beginPath();
        ctx.setLineDash([2, 5])
        ctx.strokeStyle = color ?? '#fff'
        ctx.lineWidth = 2;
        ctx.moveTo(canvasVertices[0].x, canvasVertices[0].y);

        for (const vertex of canvasVertices) {
            ctx.lineTo(vertex.x, vertex.y);
        }
        ctx.stroke();

        if (this.temporaryVertex) {
            const tmpCanvasVertex = imageCoordinatesToCanvasCoordinates(this.temporaryVertex);

            ctx.setLineDash([2, 5])
            ctx.lineTo(tmpCanvasVertex.x, tmpCanvasVertex.y);
        }

        ctx.lineTo(canvasVertices[0].x, canvasVertices[0].y)
        ctx.stroke();

        ctx.restore();
    };

    renderIcon = () => {
        return <Gesture/>
    }

    toPolygon(): Polygon {
        return new Polygon(this.vertices);
    }

    isPointInside(): boolean | undefined {
        return undefined;
    }
}
