class Passenger
{
	constructor(x, y, r, d, clr, seat)
	{
		this.pos = createVector(x, y);
		this.r = r;
		this.dx = d;
		this.clr = clr;
		this.seat = seat;
	}

	draw()
	{
		stroke(0);
		strokeWeight(2);
		fill(this.clr);
		circle(this.pos.x, this.pos.y, this.r * 2);
		strokeWeight(5);
		point(this.pos.x + this.r / 2, this.pos.y - this.r / 4);
		point(this.pos.x, this.pos.y - this.r / 4);
	}

	update()
	{
		if (this.pos.x - this.r < this.seat.pos.x) this.pos.x += this.dx;
	}
}