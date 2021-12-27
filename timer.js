class Timer
{
	static #startTimestamp;
	static #totalTime;

	static get()
	{
		return Timer.#totalTime
	};

	static update()
	{
		Timer.#totalTime = millis() - Timer.#startTimestamp
	}

	static draw()
	{
		noStroke();
		fill(0);
		textSize(48);
		text((Timer.#totalTime / 1000).toFixed(2), width / 2 - 50, height / 2 - planeWidth / 2 - wallStrokeWeight)
	}

	static reset()
	{
		Timer.#startTimestamp = millis();
		Timer.#totalTime = 0;
	}
}
