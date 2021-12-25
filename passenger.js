class Passenger
{
	constructor(x, y, r, stowTime, d, clr, seat)
	{
		this.x = x;
		this.y = y;
		this.r = r;
		this.dx = d;
		this.clr = clr;
		this.seat = seat;
		this.seatDirection = Math.sign(seat.y - y);
		this.curStowTime = stowTime;
		this.stowTime = stowTime;
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
		if (this.curStowTime > 0)
		{
			const alpha = this.curStowTime * (255 / this.stowTime);
			const baseY = this.y + 5 - (this.stowTime - this.curStowTime) * (this.r / this.stowTime);

			fill(139, 65, 0, alpha);
			stroke(0, alpha);
			strokeWeight(2);
			rect(this.x - this.r * 2 + 10, baseY, this.r * 2 - 10, this.r - 2, 3);
			line(this.x - this.r * 2 + 10, baseY + 3, this.x, baseY + 3)
		}
	}

	update()
	{
		if (this.done) return;
		if (this.x - this.r < this.seat.x) this.x += this.dx;
		else
		{
			if (this.curStowTime > 0)
			{
				--this.curStowTime;
				return;
			}

			const sideY = this.y + (this.r * -this.seatDirection);
			if (this.seatDirection < 0 ? sideY > this.seat.y + this.seat.s : sideY < this.seat.y) this.y += this.dx * this.seatDirection;
			else
			{
				this.done = true;
				this.y = this.seat.y + this.seat.s / 2;
			}
		}
	}
}