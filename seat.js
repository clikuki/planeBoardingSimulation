class Seat
{
	constructor(x, y, s, clr)
	{
		this.x = x;
		this.y = y;
		this.s = s;
		this.clr = clr;
	}

	draw()
	{
		stroke(0);
		strokeWeight(2);
		fill(this.clr);
		square(this.x, this.y, this.s, 3);
		rect(this.x + this.s / 12 * 11, this.y - 2, this.s / 6, this.s / 4 * 3.5, 1);
	}
}