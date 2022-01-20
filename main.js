const planeWidth = 260;
let method = 'random';
let allSeated = false;
let seats;
let passengers;

const boardingMethodOptions = document.querySelector('#boardingMethod');
boardingMethodOptions.addEventListener('change', () =>
{
	method = boardingMethodOptions.value;
	startSimulation();
});

const drawPlaneOutline = () =>
{
	const halfHeight = height / 2;
	const halfPlaneWidth = planeWidth / 2;
	const qtrWidth = width / 4;
	const outerEdgeOffset = 140;
	const innerEdgeOffsetX = 100;
	const innerEdgeOffsetY = 50;

	// draw walls
	stroke(150);
	strokeWeight(5);
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

const getSeats = (colCount, rowCount) =>
{
	const groupColCount = 4;
	const padding = 5;
	const seatSize = 30;
	const colPadding = padding * 2;
	const totalSeatWidth = seatSize * colCount + colPadding * colCount - colPadding;
	const aisleWidth = planeWidth - rowCount * (seatSize + padding);
	const leftOffset = (width - totalSeatWidth) / 2;
	const topOffset = height / 2 - planeWidth / 2 + 2.5;
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

const sortSeats = (seatsArray, method) =>
{
	const result = [];
	const copy = seatsArray.slice();
	while (copy.length)
	{
		let index;
		switch (method)
		{
			case 'front2back': {
				const groupSeatCount = seats.groupColCount * seats.rowCount;
				const max = result.length % groupSeatCount || groupSeatCount;
				index = Math.floor(Math.random() * max);
			}
				break;

			case 'back2front': {
				const groupSeatCount = seats.groupColCount * seats.rowCount;
				const max = result.length % groupSeatCount || groupSeatCount;
				const randNum = Math.floor(Math.random() * max);
				index = randNum + (result.length - max);
			}
				break;

			case 'random':
			default:
				index = Math.floor(Math.random() * (copy.length - 1));
				break;
		}

		result.push(copy.splice(index, 1)[0]);
	}
	return result;
}

const getPassengers = (seats, method) =>
{
	const seatsArray = sortSeats(seats.array, method);
	return seatsArray.map((seat, index) => new Passenger(index, seat)).reverse();
}

const startSimulation = () =>
{
	allSeated = false;
	seats = getSeats(16, 6);
	passengers = getPassengers(seats, method);
	Timer.reset();
}

function setup()
{
	createCanvas(900, 500);
	startSimulation();
}

function draw()
{
	background('#e0e0e0');
	drawPlaneOutline();

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
				return !otherPassenger.done && sameY && closeXDist;
			})

			if (!passengerInWay) passenger.update(deltaTime);
		}
	}

	if (!allSeated) Timer.update();
	Timer.draw();

	allSeated = allSeatedTmp;
}
