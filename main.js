const wallStrokeWeight = 5;

const drawPlaneOutline = (planeWidth) =>
{
	const halfHeight = height / 2;
	const qtrWidth = width / 4;
	const outerEdgeOffset = 140;
	const innerEdgeOffsetX = 100;
	const innerEdgeOffsetY = 50;

	// draw walls
	stroke(150);
	strokeWeight(wallStrokeWeight);
	line(0, halfHeight - planeWidth / 2, width, halfHeight - planeWidth / 2);
	line(0, halfHeight + planeWidth / 2, width, halfHeight + planeWidth / 2);

	// Draw back wing edges
	line(qtrWidth * 3, halfHeight - planeWidth / 2, qtrWidth * 3 + 20, 0);
	line(qtrWidth * 3, halfHeight + planeWidth / 2, qtrWidth * 3 + 20, height);

	// Draw front inner wing edges
	line(qtrWidth, halfHeight - planeWidth / 2, qtrWidth + innerEdgeOffsetX, halfHeight - (planeWidth / 2 + innerEdgeOffsetY));
	line(qtrWidth, halfHeight + planeWidth / 2, qtrWidth + innerEdgeOffsetX, halfHeight + (planeWidth / 2 + innerEdgeOffsetY));

	// Draw front outer wing edges
	line(qtrWidth + innerEdgeOffsetX, halfHeight - (planeWidth / 2 + innerEdgeOffsetY), qtrWidth + outerEdgeOffset, 0);
	line(qtrWidth + innerEdgeOffsetX, halfHeight + (planeWidth / 2 + innerEdgeOffsetY), qtrWidth + outerEdgeOffset, height);
}

const drawSeats = (planeWidth, colCount, rowCount, seatSize) =>
{
	const seatWidth = seatSize * colCount + 10;
	const offsetFromLeft = (width - seatWidth) / 2;

	stroke(0);
	strokeWeight(1);
	// rect((width - seatWidth) / 2, height / 2 - planeWidth / 2, seatWidth, planeWidth);
	rect(0, height / 2 - planeWidth / 2, seatWidth, planeWidth);
	for (let i = 0; i < colCount; i++)
	{
		const x = i * seatSize;
		const y = height / 2 - planeWidth / 2 + wallStrokeWeight / 2;
		square(x, y, seatSize);
	}
}

// P5 functions
function setup()
{
	createCanvas(900, 500);
}

function draw()
{
	const planeWidth = 300;

	background('#e0e0e0');
	drawPlaneOutline(planeWidth);
	drawSeats(planeWidth, 16, 6, 30);
}