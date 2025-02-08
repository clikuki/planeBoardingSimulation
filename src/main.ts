import { HTML } from "./utils.js";

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
	// TODO: on startup, scale numbers to fit viewport

	const corridorSize = canvas.height * 0.55;
	const rowCnt = 3; // Num of side by side seats
	const colCnt = 16; // Num of rows of seats
	const colSetCnt = 2; // Number of seating columns
	const rowByRowPad = 20;
	const columnEdgePad = 15;
	const backSpace = 100;
	const seatGap = 3;
	const seatSize = canvas.height * 0.068;

	const rowSizePx = (seatSize + seatGap) * rowCnt - seatGap;
	const aisleSpace =
		(corridorSize - columnEdgePad * 2 - rowSizePx * colSetCnt) / (colSetCnt - 1);
	const seats: Seat[] = Array(colSetCnt * rowCnt * colCnt)
		.fill(0)
		.map((_, i) => {
			const column = Math.floor((i % (rowCnt * colSetCnt)) / rowCnt);
			const rowIndex = Math.floor(i / rowCnt / colSetCnt);
			const rowOffset = i % rowCnt;

			const rowPosition = rowIndex * (seatSize + rowByRowPad);
			const colPosition =
				column * (rowSizePx + aisleSpace) + rowOffset * (seatSize + seatGap);
			return {
				id: String(i),
				x: canvas.width - seatSize - backSpace - rowPosition + seatSize / 2,
				y: colPosition + columnEdgePad - corridorSize / 2 + seatSize / 2,
			};
		});

	const passSpeed = canvas.height * 0.005;
	const passSeatSpeed = canvas.height * 0.003;
	const passRadii = seatSize * 0.4;
	const passGap = passRadii * 0.5;
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
		rowCnt,
		colCnt,
		colSetCnt,
		seatGap,
		seatSize,
		seats,
		passRadii,
		passSpeed,
		passGap,
		passSeatSpeed,
		stowDuration,
		stowFinishWait,
		passengers,
		iterationCounter: 0,
		iterationElem: HTML.getOne(".iterCnt")!,
	};
})();

const art = (() => {
	// Initialize drawing constants
	const planeStroke = "#999";
	const planeOutline = new Path2D();
	for (const side of [-1, 1]) {
		const sideHeights = (side * simul.corridorSize) / 2;

		// NEW: 1280 x 634
		// OLD: 1920 x 993

		planeOutline.moveTo(canvas.width * 0.375, sideHeights);
		planeOutline.lineTo(canvas.width * 0.479, sideHeights + side * 80);
		planeOutline.lineTo(canvas.width * 0.947, side * (canvas.height * 2));
		planeOutline.lineTo(canvas.width * 0.828, sideHeights);

		planeOutline.moveTo(0, sideHeights);
		planeOutline.lineTo(canvas.width, sideHeights);
	}

	const planeBody = ctx.createLinearGradient(
		0,
		-simul.corridorSize / 2 - 30,
		0,
		+simul.corridorSize / 2 + 30
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
		const bagIndex = Math.floor(Math.random() * seatBag.length);
		pass.seat = seatBag.splice(bagIndex, 1)[0];
	}
}

function clusterSeating(seatCluster = 1, reversed = false) {
	// Go either back-to-front or front-to-back
	const fullSeats = Array.from(simul.seats);
	if (reversed) fullSeats.reverse();

	let clusterIndex = 0;
	let seatBag = fullSeats.slice(
		clusterIndex * seatCluster,
		(clusterIndex + 1) * seatCluster
	);

	for (const pass of simul.passengers) {
		// Pick randomly from cluster
		const bagIndex = Math.floor(Math.random() * seatBag.length);
		pass.seat = seatBag.splice(bagIndex, 1)[0];

		if (!seatBag.length) {
			// Build next cluster
			seatBag = fullSeats.slice(
				++clusterIndex * seatCluster,
				(clusterIndex + 1) * seatCluster
			);
		}
	}
}

function WindowMiddleAisleSeating(strict = false) {
	if (simul.colSetCnt !== 2) throw Error("Only works in 2-column seatings!");

	let rowOffset = 0; // Track win-mid-aisle progress
	let indexBag: number[] = [];

	getColumnSet();
	function getColumnSet() {
		// Get subcolumn seat indices of both columns
		for (let i = 0; i < simul.colCnt; i++) {
			const bigRowIndex = i * simul.rowCnt * 2;
			indexBag.push(
				// Go outside-in
				bigRowIndex + rowOffset,
				bigRowIndex + simul.rowCnt * 2 - 1 - rowOffset
			);
		}

		if (strict) {
			// Move second column seats to the end of bag
			for (let i = 1; i <= indexBag.length / 2; i++) {
				indexBag.push(indexBag.splice(i, 1)[0]);
			}
		}
	}

	for (const pass of simul.passengers) {
		// Random column OR perfect back2front column
		const bagIndex = strict ? 0 : Math.floor(Math.random() * indexBag.length);
		pass.seat = simul.seats[indexBag.splice(bagIndex, 1)[0]];

		if (!indexBag.length) {
			rowOffset++;
			getColumnSet();
		}
	}
}

function steffenSeating() {
	if (simul.colSetCnt !== 2) throw Error("Only works in 2-column seatings!");

	let rowOffset = 0; // Track win-mid-aisle progress
	let indexBag: number[] = [];

	getColumnSet();
	function getColumnSet() {
		// Get subcolumn seat indices of both columns
		for (let i = 0; i < simul.colCnt; i++) {
			const bigRowIndex = i * simul.rowCnt * 2;
			indexBag.push(
				// Go outside-in
				bigRowIndex + rowOffset,
				bigRowIndex + simul.rowCnt * 2 - 1 - rowOffset
			);
		}

		// Push every other item to back twice
		for (let i = 1; i <= indexBag.length / 2; i++) {
			indexBag.push(indexBag.splice(i, 1)[0]);
		}
		for (let i = 0; i < indexBag.length / 2; i++) {
			indexBag.push(indexBag.splice(i, 1)[0]);
		}
	}

	for (const pass of simul.passengers) {
		const bagIndex = indexBag.shift()!;
		pass.seat = simul.seats[bagIndex];

		if (!indexBag.length) {
			rowOffset++;
			getColumnSet();
		}
	}
}

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
	if (current.y === current.seat.y) return false;

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

	return true;
}

(() => {
	const restartBtn = HTML.getOne<HTMLButtonElement>(".restart")!;
	const fastForwardBtn = HTML.getOne<HTMLButtonElement>(".ffd")!;
	const seatingSelection = HTML.getOne<HTMLSelectElement>(".seating")!;
	seatingSelection.value = "random";

	restart();
	function restart() {
		simul.iterationCounter = 0;
		resetPassengers();

		// Run seating algorithm
		const value = seatingSelection.value;
		if (value === "random") {
			randomSeating();
		} else if (value === "b2f") {
			clusterSeating(simul.colSetCnt * simul.rowCnt * 4);
		} else if (value === "f2b") {
			clusterSeating(simul.colSetCnt * simul.rowCnt * 4, true);
		} else if (value === "wma") {
			WindowMiddleAisleSeating();
		} else if (value === "wmab2f") {
			WindowMiddleAisleSeating(true);
		} else if (value === "steffen") {
			steffenSeating();
		}
	}

	restartBtn.addEventListener("click", restart);
	seatingSelection.addEventListener("change", restart);
	fastForwardBtn.addEventListener("click", () => {
		while (true) {
			let passengerMoved = false;
			for (let i = 0; i < simul.passengers.length; i++) {
				passengerMoved = movePassenger(i) || passengerMoved;
			}

			if (passengerMoved) simul.iterationCounter++;
			else break;
		}
	});
})();

function update() {
	let passengerMoved = false;
	for (let i = 0; i < simul.passengers.length; i++) {
		passengerMoved = movePassenger(i) || passengerMoved;
	}

	if (passengerMoved) simul.iterationCounter++;
}

function draw() {
	simul.iterationElem.textContent = simul.iterationCounter.toString();

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
	ctx.lineWidth = canvas.height * 0.005;
	ctx.strokeStyle = "#111";
	ctx.lineCap = "round";
	const trueSeatSize = simul.seatSize - ctx.lineWidth;
	let seatCount = 0;
	for (const { x, y } of simul.seats) {
		// ctx.fillStyle = "#38f";
		// ctx.beginPath();
		// ctx.roundRect(
		// 	x - simul.seatSize / 2,
		// 	y - simul.seatSize / 2,
		// 	simul.seatSize,
		// 	simul.seatSize,
		// 	4
		// );
		// ctx.fill();
		// ctx.stroke();

		const subindex = Math.floor(seatCount++ / simul.colSetCnt / simul.rowCnt);
		if (subindex % 2 === 0) {
			ctx.fillStyle = "#38f";
		} else {
			ctx.fillStyle = "#36d";
		}

		ctx.beginPath();
		ctx.roundRect(
			x - simul.seatSize / 2 + ctx.lineWidth / 2,
			y - simul.seatSize / 2 + ctx.lineWidth / 2,
			trueSeatSize,
			trueSeatSize,
			4
		);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.roundRect(
			x + simul.seatSize / 2 - simul.seatSize * 0.1 - ctx.lineWidth,
			y - simul.seatSize / 2,
			simul.seatSize * 0.2,
			simul.seatSize * 0.8,
			2
		);
		ctx.fill();
		ctx.stroke();
	}

	// Passenger
	ctx.beginPath();
	for (const { x, y, stowTime } of simul.passengers) {
		// Body
		ctx.beginPath();
		ctx.moveTo(x - simul.passRadii, y);
		ctx.ellipse(x, y, simul.passRadii, simul.passRadii, 0, -Math.PI, Math.PI);

		// Face
		ctx.save();
		ctx.translate(x, y);
		const side = y === 0 ? 1 : -1;
		const eyeY = -simul.passRadii * 0.2;
		const mouthY = simul.passRadii * 0.6;
		const mouthX = Math.sqrt(simul.passRadii ** 2 - mouthY ** 2) * side;
		const size = simul.passRadii * 0.1;

		ctx.moveTo(mouthX, mouthY);
		ctx.lineTo(0, mouthY);

		ctx.moveTo(0, eyeY);
		ctx.ellipse(0, eyeY, size, size, 0, 0, Math.PI * 2);
		ctx.moveTo(mouthX, eyeY);
		ctx.ellipse(mouthX, eyeY, size, size, 0, 0, Math.PI * 2);
		ctx.restore();

		ctx.fillStyle = "#ffd32f";
		ctx.strokeStyle = "#111";
		ctx.lineCap = "round";
		ctx.lineWidth = canvas.height * 0.005;
		ctx.fill();
		ctx.stroke();

		// Bag
		ctx.beginPath();

		const bagProg = (simul.stowDuration - stowTime) / simul.stowDuration;
		const bagOffset = simul.passRadii * bagProg;
		const bagX = x - simul.passRadii * (3 / 2);
		const bagY = y + 6 - bagOffset;
		const bagWidth = simul.passRadii * 1.6 - 4;
		const bagHeight = simul.passRadii;
		ctx.save();
		ctx.translate(bagX + bagWidth / 2, bagY);
		ctx.rotate(Math.PI * bagProg);

		// Case
		ctx.roundRect(-bagWidth / 2, 0, bagWidth, bagHeight, 2);

		// Pocket
		ctx.moveTo(-bagWidth / 2 + 5, 5);
		ctx.lineTo(bagWidth / 2 - 5, 5);

		// Handle
		ctx.moveTo(-8, 2);
		ctx.lineTo(-6, -3);
		ctx.lineTo(6, -3);
		ctx.lineTo(8, 2);
		ctx.restore();

		const opacity = (1 - bagProg).toString();
		ctx.fillStyle = `rgba(150, 75, 0, ${opacity})`;
		ctx.strokeStyle = `rgba(34,34,34,${opacity})`;
		ctx.lineWidth = canvas.height * 0.002;
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
