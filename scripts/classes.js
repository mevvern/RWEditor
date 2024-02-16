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
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.reset = () => {
			this.x1 = 0;
			this.y1 = 0;
			this.x2 = 0;
			this.y2 = 0;
		}
	}
}

class Tile {
	constructor() {
		this.tp = "default";
		this.Data = 0;
	}
}