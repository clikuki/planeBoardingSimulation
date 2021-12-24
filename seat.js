class Seat
{
	constructor(x, y, s, clr)
	{
		this.pos = createVector(x, y);
		this.s = s;
		this.clr = clr;
	}

	draw()
	{
		stroke(0);
		strokeWeight(2);
		fill(this.clr);
		square(this.pos.x, this.pos.y, this.s, 3);
		rect(this.pos.x + this.s / 12 * 11, this.pos.y - 2, this.s / 6, this.s / 4 * 3.5, 1);
	}
}