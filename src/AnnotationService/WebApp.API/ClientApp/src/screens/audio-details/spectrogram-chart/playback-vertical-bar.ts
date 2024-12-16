import {Drawable, Polygon} from './drawables';
import {Point} from "./helpers";

export class PlaybackVerticalBar implements Drawable {
    private time: number;
    disabled: boolean;

    constructor(time: number) {
        this.time = time;
        this.disabled = false;
    }


    draw(canvas: HTMLCanvasElement, imageCoordinatesToCanvasCoordinates: (p: Point) => Point, color: string | undefined): void {
        const canvasX = imageCoordinatesToCanvasCoordinates({x: this.time, y: 0}).x;
        const ctx = canvas.getContext("2d")!;

        ctx.save()
        ctx.strokeStyle = color ?? '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(canvasX, 0)
        ctx.lineTo(canvasX, canvas.height);
        ctx.stroke();

        ctx.restore();

    }

    toPolygon(): Polygon {
        throw new Error("Polygon cannot be created for PlaybackBar");
    }

    isPointInside(): boolean | undefined {
        return false;
    }


}