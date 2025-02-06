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
		rowSize,
		colSize,
		colCnt,
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

function resetPassengers() {
	for (let i = 0; i < simul.passengers.length; i++) {
		const pass = simul.passengers[i];
		pass.x = -i * (simul.passRadii * 2 + simul.passGap);
		pass.y = 0;
		pass.stowTime = simul.stowDuration;
	}
}

function randomSeating() {
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

function clusterSeating(seatCluster = 1, reversed = false) {
	// Go either back-to-front or front-to-back
	const seats = Array.from(simul.seats);
	if (reversed) seats.reverse();

	// Pick randomly from cluster
	let clusterIndex = 0;
	let cluster = seats.slice(
		clusterIndex * seatCluster,
		(clusterIndex + 1) * seatCluster
	);

	for (const pass of simul.passengers) {
		const seat = randomItemInArray(cluster);
		pass.seat = seat;
		cluster.splice(
			cluster.findIndex((s) => s === seat),
			1
		);

		if (!cluster.length) {
			cluster = seats.slice(
				++clusterIndex * seatCluster,
				(clusterIndex + 1) * seatCluster
			);
		}
	}
}

// Window-Middle-Aisle
function WMASeating(strict = false) {
	if (simul.colCnt !== 2) return;

	let rowOffset = 0;
	let bag: number[] = [];

	getColumnSet();
	function getColumnSet() {
		for (let i = 0; i < simul.colSize; i++) {
			const bigRowIndex = i * simul.rowSize * 2;
			bag.push(
				bigRowIndex + rowOffset,
				bigRowIndex + simul.rowSize * 2 - 1 - rowOffset
			);
		}

		// Moves second column seats to the end of bag
		if (strict) {
			for (let i = 1; i <= bag.length / 2; i++) {
				bag.push(bag.splice(i, 1)[0]);
			}
		}
	}

	for (const pass of simul.passengers) {
		// Random column OR back to front column
		const bagIndex = strict ? bag.shift()! : randomItemInArray(bag);
		pass.seat = simul.seats[bagIndex];
		if (!strict)
			bag.splice(
				bag.findIndex((s) => s === bagIndex),
				1
			);

		if (!bag.length) {
			rowOffset++;
			getColumnSet();
		}
	}
}

function steffenPerfect() {
	if (simul.colCnt !== 2) return;

	let rowOffset = 0;
	let bag: number[] = [];

	getColumnSet();
	function getColumnSet() {
		for (let i = 0; i < simul.colSize; i++) {
			const bigRowIndex = i * simul.rowSize * 2;
			bag.push(
				bigRowIndex + rowOffset,
				bigRowIndex + simul.rowSize * 2 - 1 - rowOffset
			);
		}

		for (let i = 1; i <= bag.length / 2; i++) {
			bag.push(bag.splice(i, 1)[0]);
		}
		for (let i = 0; i < bag.length / 2; i++) {
			bag.push(bag.splice(i, 1)[0]);
		}
	}

	for (const pass of simul.passengers) {
		// Random column OR back to front column
		const bagIndex = bag.shift()!;
		pass.seat = simul.seats[bagIndex];

		if (!bag.length) {
			rowOffset++;
			getColumnSet();
		}
	}
}

// simul.passengers.length = 4;
// simul.passengers[0].seat = simul.seats.at(-3)!;
// simul.passengers[1].seat = simul.seats.at(-2)!;
// simul.passengers[2].seat = simul.seats.at(-12)!;
// simul.passengers[3].seat = simul.seats.at(-6)!;
randomSeating();

const dummyPassenger: Passenger = Object.freeze({
	x: Infinity,
	y: Infinity,
	stowTime: -simul.stowFinishWait,
	seat: Object.freeze({ x: Infinity, y: Infinity }),
});

function findClosestPassenger(
	comparator: (best: Passenger, pass: Passenger, current: Passenger) => boolean,
	currentIndex: number
): Passenger {
	const current = simul.passengers[currentIndex];
	return simul.passengers.slice(0, currentIndex).reduce((best, pass) => {
		return comparator(best, pass, current) ? pass : best;
	}, dummyPassenger);
}
const comparators = {
	inAisle(b: Passenger, p: Passenger) {
		return Math.abs(p.y) <= simul.passRadii * 2 && p.x < b.x;
	},
	inRow(b: Passenger, p: Passenger, c: Passenger) {
		return p.x === c.x && Math.abs(p.y - c.y) < Math.abs(b.y - c.y);
	},
};

function movePassenger(index: number) {
	// Skip if passenger is already at its seat
	const current = simul.passengers[index];
	if (current.y === current.seat.y) return;

	if (current.x === current.seat.x) {
		// Passenger is in the correct row; handle stowing and seating
		if (--current.stowTime <= 0) {
			const ahead = findClosestPassenger(comparators.inRow, index);
			const distanceAhead = Math.hypot(current.x - ahead.x, current.y - ahead.y);

			// Slow down if moving over another passenger
			let speed = simul.passSeatSpeed;
			if (distanceAhead <= simul.passRadii) {
				speed *= 0.6;
			}

			// Move closer to the seat, but not past it
			const dir = Math.sign(current.seat.y);
			current.y =
				dir * Math.min(Math.abs(current.y) + speed, Math.abs(current.seat.y));
		}
	} else {
		// Passenger is still walking down the corridor
		const ahead = findClosestPassenger(comparators.inAisle, index);
		const distanceAhead = Math.hypot(current.x - ahead.x, current.y - ahead.y);

		// Only move forward if there is enough space ahead
		const minimumDistance = simul.passRadii * 2 + simul.passGap;
		if (distanceAhead > minimumDistance) {
			current.x = Math.min(current.x + simul.passSpeed, current.seat.x);
			// If the passenger ahead is stowing, don't get too close
			if (ahead.stowTime > -simul.stowFinishWait) {
				current.x = Math.min(current.x, ahead.x - minimumDistance);
			}
		}
	}
}

function update() {
	for (let i = 0; i < simul.passengers.length; i++) {
		movePassenger(i);
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
