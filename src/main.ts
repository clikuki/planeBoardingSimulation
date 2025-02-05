import { HTML, randomItemInArray } from "./utils.js";

interface Seat {
	x: number;
	y: number;
}
interface Passenger {
	x: number;
	y: number;
	stowTime: number;
	seat: Seat;
}

const canvas = HTML.getOne<HTMLCanvasElement>("canvas")!;
const ctx = canvas.getContext("2d")!;

// Initialize canvas
canvas.width = innerWidth;
canvas.height = innerHeight;

const simul = (() => {
	// Initialize data
	const seatSize = 68;
	const rowByRowPad = 20;
	const columnEdgePad = 15;
	const backSpace = 100;

	const rowSize = 3; // Num of side by side seats
	const colSize = 16; // Num of rows of seats
	const colCnt = 2; // Number of seating columns

	const corridorSize = canvas.height * 0.5;

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

	const passSpeed = 5;
	const passSeatSpeed = 3;
	const passRadii = seatSize * 0.4;
	const passGap = 8;
	const stowDuration = 100;
	const stowFinishWait = 20;
	const passengers: Passenger[] = seats.map((s, i) => ({
		x: -i * (passRadii * 2 + passGap),
		y: 0,
		stowTime: stowDuration,
		seat: s,
	}));

	return {
		corridorSize,
		seatSize,
		seats,
		passRadii,
		passSpeed,
		passGap,
		passSeatSpeed,
		stowDuration,
		stowFinishWait,
		passengers,
	};
})();

function resetPassengers() {
	for (let i = 0; i < simul.passengers.length; i++) {
		const pass = simul.passengers[i];
		pass.x = -i * (simul.passRadii * 2 + simul.passGap);
		pass.y = 0;
		pass.stowTime = simul.stowDuration;
	}
}

function randomPassengers() {
	const seatBag = Array.from(simul.seats);
	for (const pass of simul.passengers) {
		const seat = randomItemInArray(seatBag);
		pass.seat = seat;
		seatBag.splice(
			seatBag.findIndex((s) => s === seat),
			1
		);
	}
}

const art = (() => {
	// Initialize drawing constants
	const planeStroke = "#999";
	const planeOutline = new Path2D();
	for (const side of [-1, 1]) {
		planeOutline.moveTo(canvas.width - 1200, side * (simul.corridorSize / 2));
		planeOutline.lineTo(
			canvas.width - 1000,
			side * (simul.corridorSize / 2 + 80)
		);
		planeOutline.lineTo(canvas.width - 900, side * (canvas.height / 2 + 10));

		planeOutline.moveTo(canvas.width - 300, side * (canvas.height / 2 + 10));
		planeOutline.lineTo(canvas.width - 330, side * (simul.corridorSize / 2));

		const sideHeights = (side * simul.corridorSize) / 2;
		planeOutline.moveTo(0, sideHeights);
		planeOutline.lineTo(canvas.width, sideHeights);
	}

	const planeBody = ctx.createLinearGradient(
		0,
		-simul.corridorSize / 2 - 40,
		0,
		+simul.corridorSize / 2 + 40
	);
	planeBody.addColorStop(0, "transparent");
	planeBody.addColorStop(0.05, "#777");
	planeBody.addColorStop(0.95, "#777");
	planeBody.addColorStop(1, "transparent");

	return {
		planeStroke,
		planeOutline,
		planeBody,
	};
})();

// simul.passengers.length = 1;
resetPassengers();
randomPassengers();
function update() {
	const passCenterDist = simul.passRadii * 2 + simul.passGap;
	for (let i = 0; i < simul.passengers.length; i++) {
		const curr = simul.passengers[i];
		if (curr.y === curr.seat.y) continue;

		if (curr.x === curr.seat.x) {
			// Shuffle into seat after stowing bag
			if (--curr.stowTime <= 0) {
				const dir = Math.sign(curr.seat.y);
				const USelfY = Math.abs(curr.y) + simul.passSeatSpeed;
				const USeatY = Math.abs(curr.seat.y);
				curr.y = dir * Math.min(USelfY, USeatY);
			}

			continue;
		}

		// Get passenger in front
		const ahead = simul.passengers.slice(0, i).reduce(
			(best, pass) => {
				if (Math.abs(pass.y) <= simul.passRadii && pass.x < best.x) {
					return pass;
				} else {
					return best;
				}
			},
			{
				x: Infinity,
				y: Infinity,
				stowTime: -simul.stowFinishWait,
			}
		);
		const aheadDist = Math.hypot(curr.x - ahead.x, curr.y - ahead.y);

		// Walk forward if space in front is empty
		if (aheadDist > passCenterDist) {
			curr.x = Math.min(curr.x + simul.passSpeed, curr.seat.x);
			if (ahead.stowTime > -simul.stowFinishWait) {
				curr.x = Math.min(curr.x, ahead.x - passCenterDist);
			}
		}
	}
}

function draw() {
	// Clear screen
	ctx.fillStyle = "#112";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	ctx.translate(0, canvas.height / 2);

	// Plane gradient
	ctx.fillStyle = art.planeBody;
	ctx.fillRect(0, -canvas.height / 2, canvas.width, canvas.height);

	// Plane outline
	ctx.lineWidth = 10;
	ctx.strokeStyle = art.planeStroke;
	ctx.stroke(art.planeOutline);

	// Seats
	const seatGap = 2;
	ctx.beginPath();
	for (const { x, y } of simul.seats) {
		ctx.roundRect(
			x - simul.seatSize / 2 + seatGap,
			y - simul.seatSize / 2 + seatGap,
			simul.seatSize - seatGap * 2,
			simul.seatSize - seatGap * 2,
			4
		);
	}
	ctx.fillStyle = "#226";
	ctx.fill();

	// Passenger
	ctx.beginPath();
	for (const { x, y, stowTime } of simul.passengers) {
		const bagX = x - simul.passRadii + 2;
		const bagProg = (simul.stowDuration - stowTime) / simul.stowDuration;
		const bagOffset = simul.passRadii * bagProg;
		const bagY = y - bagOffset;

		ctx.beginPath();
		ctx.moveTo(x - simul.passRadii, y);
		ctx.ellipse(x, y, simul.passRadii, simul.passRadii, 0, -Math.PI, Math.PI);
		ctx.fillStyle = "#ffd32f";
		ctx.strokeStyle = "#222";
		ctx.lineWidth = 4;
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.roundRect(bagX, bagY, simul.passRadii * 1.6 - 4, simul.passRadii, 2);

		const opacity = (1 - bagProg).toString();
		ctx.fillStyle = `rgba(150, 75, 0, ${opacity})`;
		ctx.strokeStyle = `rgba(34,34,34,${opacity})`;
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();
	}

	ctx.restore();
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}
loop();
