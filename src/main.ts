import { HTML } from "./utils.js";

const canvas = HTML.getOne<HTMLCanvasElement>("canvas")!;
const ctx = canvas.getContext("2d")!;

// Initialize canvas
canvas.width = innerWidth;
canvas.height = innerHeight;

function update() {}

function draw() {
	// Clear screen
	ctx.fillStyle = "#112";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}
loop();
