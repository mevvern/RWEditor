class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.reset = () => {
            this.y = 0;
            this.x = 0;
        }
    }
}

class Rect {
    constructor(x1, y1, x2, y2) {
        this.corner1 = new Point(x1, y1);
        this.corner2 = new Point(x2, y2);
        this.reset = () => {
            this.corner1.reset();
            this.corner2.reset();
        }
    }
}