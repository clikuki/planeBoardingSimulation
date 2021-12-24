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

const drawSeats = (planeWidth, colCount, rowCount, colPadding, rowPadding, seatSize) =>
{
	const totalSeatWidth = seatSize * colCount + colPadding * colCount - colPadding;
	const aisleWidth = planeWidth - rowCount * (seatSize + rowPadding);
	const leftOffset = (width - totalSeatWidth) / 2;
	const topOffset = height / 2 - planeWidth / 2 + wallStrokeWeight / 2;

	stroke(0);
	strokeWeight(1);
	// rect(leftOffset, height / 2 - planeWidth / 2 + wallStrokeWeight / 2, totalSeatWidth, planeWidth - wallStrokeWeight);
	for (let x = leftOffset; x < totalSeatWidth + leftOffset; x += seatSize + colPadding)
	{
		for (let i = 0; i < rowCount; i++)
		{
			const y = i * (seatSize + rowPadding) + (i >= rowCount / 2 ? aisleWidth : 0) + topOffset;
			square(x, y, seatSize);
		}
	}
}

// P5 functions
function setup()
{
	createCanvas(900, 500);
}

function draw()
{
	const planeWidth = 250;

	background('#e0e0e0');
	drawPlaneOutline(planeWidth);
	drawSeats(planeWidth, 16, 6, 10, 5, 30);
}