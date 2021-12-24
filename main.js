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

const getSeats = (planeWidth, colCount, rowCount, colPadding, rowPadding, seatSize) =>
{
	const totalSeatWidth = seatSize * colCount + colPadding * colCount - colPadding;
	const aisleWidth = planeWidth - rowCount * (seatSize + rowPadding);
	const leftOffset = (width - totalSeatWidth) / 2;
	const topOffset = height / 2 - planeWidth / 2 + wallStrokeWeight / 2;
	const hexArr = ['#3391fe', '#2b5cc2'];
	let curHexIndex = 0;

	return Array.from({ length: colCount }, (_, i) =>
	{
		if (!(i % 4)) curHexIndex = (curHexIndex + 1) % 2;
		const x = i * (seatSize + colPadding) + leftOffset;
		const clr = color(hexArr[curHexIndex]);

		return Array.from({ length: rowCount }, (_, j) =>
		{
			const y = j * (seatSize + rowPadding) + (j >= rowCount / 2 ? aisleWidth - rowPadding : rowPadding) + topOffset;
			return new Seat(x, y, seatSize, clr);
		})
	}).flat();
}

// P5 section
const planeWidth = 250;
let seats;

function setup()
{
	createCanvas(900, 500);
	seats = getSeats(planeWidth, 16, 6, 10, 5, 30);
}

function draw()
{

	background('#e0e0e0');
	drawPlaneOutline(planeWidth);
	seats.forEach(seat => seat.draw());
}