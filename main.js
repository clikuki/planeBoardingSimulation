const wallStrokeWeight = 5;

const drawPlaneOutline = (planeWidth) =>
{
	const halfHeight = height / 2;
	const halfPlaneWidth = planeWidth / 2;
	const qtrWidth = width / 4;
	const outerEdgeOffset = 140;
	const innerEdgeOffsetX = 100;
	const innerEdgeOffsetY = 50;

	// draw walls
	stroke(150);
	strokeWeight(wallStrokeWeight);
	line(0, halfHeight - halfPlaneWidth, width, halfHeight - halfPlaneWidth);
	line(0, halfHeight + halfPlaneWidth, width, halfHeight + halfPlaneWidth);

	// Draw back wing edges
	line(qtrWidth * 3, halfHeight - halfPlaneWidth, qtrWidth * 3 + 20, 0);
	line(qtrWidth * 3, halfHeight + halfPlaneWidth, qtrWidth * 3 + 20, height);

	// Draw front inner wing edges
	line(qtrWidth, halfHeight - halfPlaneWidth, qtrWidth + innerEdgeOffsetX, halfHeight - (halfPlaneWidth + innerEdgeOffsetY));
	line(qtrWidth, halfHeight + halfPlaneWidth, qtrWidth + innerEdgeOffsetX, halfHeight + (halfPlaneWidth + innerEdgeOffsetY));

	// Draw front outer wing edges
	line(qtrWidth + innerEdgeOffsetX, halfHeight - (halfPlaneWidth + innerEdgeOffsetY), qtrWidth + outerEdgeOffset, 0);
	line(qtrWidth + innerEdgeOffsetX, halfHeight + (halfPlaneWidth + innerEdgeOffsetY), qtrWidth + outerEdgeOffset, height);
}

const getSeats = (planeWidth, colCount, rowCount, groupColCount, padding, seatSize) =>
{
	const colPadding = padding * 2;
	const totalSeatWidth = seatSize * colCount + colPadding * colCount - colPadding;
	const aisleWidth = planeWidth - rowCount * (seatSize + padding);
	const leftOffset = (width - totalSeatWidth) / 2;
	const topOffset = height / 2 - planeWidth / 2 + wallStrokeWeight / 2;
	const hexArr = ['#3391fe', '#2b5cc2'];
	let curHexIndex = 0;

	const seatArray = Array.from({ length: colCount }, (_, i) =>
	{
		if (!(i % groupColCount)) curHexIndex = ++curHexIndex % 2;
		const x = i * (seatSize + colPadding) + leftOffset;
		const clr = color(hexArr[curHexIndex]);

		return Array.from({ length: rowCount }, (_, j) =>
		{
			const y = j * (seatSize + padding) + (j >= rowCount / 2 ? aisleWidth - padding : padding) + topOffset;
			return new Seat(x, y, seatSize, clr);
		})
	}).flat()

	return {
		rowCount,
		colCount,
		groupColCount,
		array: seatArray,
		numOfSeats: seatArray.length,
	}
}

const getPassengers = (r, d, minStowTime, maxStowTime, clr, seats, method) =>
{
	const passengers = [];

	// Make a copy of seats array
	const seatsArray = seats.array.map(seat => seat);

	while (seatsArray.length)
	{
		let index;
		switch (method)
		{
			case 'back2Front': {
				const groupSeatCount = seats.groupColCount * seats.rowCount;
				const max = seatsArray.length % groupSeatCount || groupSeatCount;
				const randNum = Math.floor(Math.random() * max);
				index = randNum + (seatsArray.length - max);
			}
				break;

			case 'random':
			default:
				index = Math.floor(Math.random() * (seatsArray.length - 1));
				break;
		}

		const [seat] = seatsArray.splice(index, 1);
		const x = (-r * 2 - -15) * (passengers.length + 1);
		const y = height / 2;
		const stowTime = ((Math.random() * (maxStowTime - maxStowTime + 1)) + minStowTime) * 1000;
		passengers.unshift(new Passenger(x, y, r, stowTime, d, clr, seat));
	}

	return passengers;
}

// P5 section
const planeWidth = 250;
let allSeated = false;
let seats;
let passengers;

function setup()
{
	createCanvas(900, 500);
	// seats = getSeats(planeWidth, 1, 1, 10, 5, 30);
	seats = getSeats(planeWidth, 16, 6, 4, 5, 30);
	passengers = getPassengers(15, 10, 1, 3, color(255, 255, 0), seats, 'back2Front');
	timer.reset();
}

function draw()
{
	background('#e0e0e0');
	drawPlaneOutline(planeWidth);

	seats.array.forEach(seat => seat.draw());

	let allSeatedTmp = true;
	for (let i = passengers.length - 1; i >= 0; i--)
	{
		const passenger = passengers[i];
		passenger.draw();

		if (!passenger.done)
		{
			allSeatedTmp = false;

			const passengerInWay = passengers.slice(i + 1).some(otherPassenger =>
			{
				const sameY = otherPassenger.y === passenger.y;
				const closeXDist = passenger.x + passenger.r + 10 >= otherPassenger.x - otherPassenger.r;
				return sameY && closeXDist;
			})

			if (!passengerInWay) passenger.update(deltaTime);
		}
	}

	if (!allSeated) timer.update();
	timer.draw();

	allSeated = allSeatedTmp;
}