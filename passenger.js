class Passenger
{
	#stowTime;
	#curStowTime;
	#seatDirection;

	constructor(x, y, r, stowTime, d, clr, seat)
	{
		this.x = x;
		this.y = y;
		this.r = r;
		this.d = d;
		this.clr = clr;
		this.seat = seat;
		this.#seatDirection = Math.sign(seat.y - y);
		this.#curStowTime = stowTime;
		this.#stowTime = stowTime;
	}

	draw()
	{
		// Body
		stroke(0);
		strokeWeight(2);
		fill(this.clr);
		circle(this.x, this.y, this.r * 2);
		strokeWeight(5);

		// Eyes
		point(this.x + (this.y === height / 2 ? 1 : -1) * this.r / 2, this.y - this.r / 4);
		point(this.x, this.y - this.r / 4);

		// Bag
		if (this.#curStowTime > 0)
		{
			const alpha = this.#curStowTime * (255 / this.#stowTime);
			const angle = (this.#stowTime - this.#curStowTime) * (PI / this.#stowTime);
			const baseY = this.y + 5 - (this.#stowTime - this.#curStowTime) * (this.r / this.#stowTime);

			push();
			fill(139, 65, 0, alpha);
			stroke(0, alpha);
			strokeWeight(2);
			translate(this.x - this.r + 5, baseY);
			rotate(angle);
			rect(this.r / -2, 0, this.r * 2 - 10, this.r - 2, 3);
			line(this.r / -2, this.r / 5, this.r * 1.5 - 10, this.r / 5)
			pop();
		}
	}

	update(delta)
	{
		if (this.done) return;
		if (this.x - this.r < this.seat.x) this.x += (this.d * delta / 60);
		else
		{
			this.x = this.seat.x + this.seat.s / 2;

			if (this.#curStowTime > 0)
			{
				this.#curStowTime -= delta;
				return;
			}

			const sideY = this.y + (this.r * -this.#seatDirection);
			if (this.#seatDirection < 0 ? sideY > this.seat.y + this.seat.s : sideY < this.seat.y) this.y += ((this.d * this.#seatDirection) * delta / 60);
			else
			{
				this.done = true;
				this.y = this.seat.y + this.seat.s / 2;
			}
		}
	}
}