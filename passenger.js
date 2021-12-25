class Passenger
{
	constructor(x, y, r, d, clr, seat)
	{
		this.x = x;
		this.y = y;
		this.r = r;
		this.dx = d;
		this.clr = clr;
		this.seat = seat;
		this.seatDirection = Math.sign(seat.y - y);
	}

	draw()
	{
		stroke(0);
		strokeWeight(2);
		fill(this.clr);
		circle(this.x, this.y, this.r * 2);
		strokeWeight(5);
		point(this.x + this.r / 2, this.y - this.r / 4);
		point(this.x, this.y - this.r / 4);
	}

	update()
	{
		if (this.done) return;
		if (this.x - this.r < this.seat.x) this.x += this.dx;
		else
		{
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