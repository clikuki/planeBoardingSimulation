import { HTML } from "./utils.js";

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
}
planeOutline.moveTo(0, -corridorSize / 2);
planeOutline.lineTo(canvas.width, -corridorSize / 2);
planeOutline.moveTo(0, corridorSize / 2);
planeOutline.lineTo(canvas.width, corridorSize / 2);

const planeBody = ctx.createLinearGradient(
	0,
	canvas.height / 2 - corridorSize / 2 - 40,
	0,
	canvas.height / 2 + corridorSize / 2 + 40
);
planeBody.addColorStop(0, "transparent");
planeBody.addColorStop(0.05, "#777");
planeBody.addColorStop(0.95, "#777");
planeBody.addColorStop(1, "transparent");

function update() {}

function draw() {
	// Clear screen
	ctx.fillStyle = "#112";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw plane gradient
	ctx.fillStyle = planeBody;
	ctx.fillRect(0, corridorSize / 2 - 50, canvas.width, corridorSize + 100);

	ctx.save();
	ctx.translate(0, canvas.height / 2);

	// Draw plane outline
	ctx.lineWidth = 10;
	ctx.strokeStyle = planeStroke;
	ctx.stroke(planeOutline);

	ctx.restore();
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}
loop();
