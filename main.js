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

const drawSeats = (planeWidth, colCount, rowCount, seatSize, padding) =>
{
	const seatWidth = seatSize * colCount + padding * colCount - padding;
	const leftOffset = (width - seatWidth) / 2;

	stroke(0);
	strokeWeight(1);
	rect(leftOffset, height / 2 - planeWidth / 2 + wallStrokeWeight / 2, seatWidth, planeWidth - wallStrokeWeight);
	for (let i = 0; i < colCount; i++)
	{
		const x = i * seatSize + leftOffset + (padding * i);
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
	drawSeats(planeWidth, 16, 6, 30, 5);
}