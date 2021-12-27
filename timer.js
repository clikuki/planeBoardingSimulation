const timer = (() =>
{
	let startTimestamp;
	let totalTime;

	return {
		get: () => totalTime,
		update: () => totalTime = millis() - startTimestamp,
		draw: () =>
		{
			noStroke();
			fill(0);
			textSize(48);
			text((totalTime / 1000).toFixed(2), width / 2 - 50, height / 2 - planeWidth / 2 - wallStrokeWeight)
		},
		reset: () =>
		{
			startTimestamp = millis();
			totalTime = 0;
		},
	}
})()