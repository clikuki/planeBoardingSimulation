import { HTML, shuffle } from "./utils.js";

const canvas = HTML.getOne<HTMLCanvasElement>("canvas")!;
const ctx = canvas.getContext("2d")!;

// Initialize canvas
canvas.width = innerWidth;
canvas.height = innerHeight;

const corridorSize = canvas.height * 0.5;

const planeStroke = "#999";
const planeOutline = new Path2D();
for (const side of [-1, 1]) {
	planeOutline.moveTo(canvas.width - 1200, side * (corridorSize / 2));
	planeOutline.lineTo(canvas.width - 1000, side * (corridorSize / 2 + 80));
	planeOutline.lineTo(canvas.width - 900, side * (canvas.height / 2 + 10));

	planeOutline.moveTo(canvas.width - 300, side * (canvas.height / 2 + 10));
	planeOutline.lineTo(canvas.width - 330, side * (corridorSize / 2));

	const sideHeights = (side * corridorSize) / 2;
	planeOutline.moveTo(0, sideHeights);
	planeOutline.lineTo(canvas.width, sideHeights);
}

const planeBody = ctx.createLinearGradient(
	0,
	-corridorSize / 2 - 40,
	0,
	+corridorSize / 2 + 40
);
planeBody.addColorStop(0, "transparent");
planeBody.addColorStop(0.05, "#777");
planeBody.addColorStop(0.95, "#777");
planeBody.addColorStop(1, "transparent");

interface Seat {
	x: number;
	y: number;
}
const seatSize = 68;
const rowByRowPad = 20;
const columnEdgePad = 15;
const backSpace = 100;

const rowSize = 3; // Num of side by side seats
const colSize = 16; // Num of rows of seats
const colCnt = 2; // Number of seating columns

const rowSizePx = seatSize * rowSize + columnEdgePad * 2;
const aisleSpace = (corridorSize - rowSizePx * colCnt) / (colCnt - 1);
const seats: Seat[] = Array(colCnt * rowSize * colSize)
	.fill(0)
	.map((_, i) => {
		const column = Math.floor((i % (rowSize * colCnt)) / rowSize);
		const rowIndex = Math.floor(i / rowSize / colCnt);
		const rowOffset = i % rowSize;

		const rowPosition = rowIndex * (seatSize + rowByRowPad);
		const colPosition = column * (rowSizePx + aisleSpace) + rowOffset * seatSize;
		return {
			id: String(i),
			x: canvas.width - seatSize - backSpace - rowPosition + seatSize / 2,
			y: columnEdgePad + colPosition - corridorSize / 2 + seatSize / 2,
		};
	});
const seatIndices = new Map(seats.map((s, i) => [s, i]));

function update() {}

function draw() {
	// Clear screen
	ctx.fillStyle = "#112";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	ctx.translate(0, canvas.height / 2);

	// Plane gradient
	ctx.fillStyle = planeBody;
	ctx.fillRect(0, -canvas.height / 2, canvas.width, canvas.height);

	// Plane outline
	ctx.lineWidth = 10;
	ctx.strokeStyle = planeStroke;
	ctx.stroke(planeOutline);

	// Seats
	const seatGap = 2;
	ctx.beginPath();
	for (const { x, y } of seats) {
		ctx.roundRect(
			x - seatSize / 2 + seatGap,
			y - seatSize / 2 + seatGap,
			seatSize - seatGap * 2,
			seatSize - seatGap * 2,
			4
		);
	}
	ctx.fillStyle = "#226";
	ctx.fill();

	// Seat ID
	ctx.fillStyle = "#449";
	ctx.font = "20px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (const seat of seats) {
		const index = seatIndices.get(seat) ?? NaN;
		ctx.fillText(String(index), seat.x, seat.y);
	}

	ctx.restore();
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}
loop();
