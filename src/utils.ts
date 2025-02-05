export const HTML = {
	getOne<T extends HTMLElement>(selectors: string, base = document.body) {
		return base.querySelector(selectors) as T | null;
	},
	getAll<T extends HTMLElement>(selectors: string, base = document.body) {
		return Array.from(base.querySelectorAll(selectors)) as T[];
	},
};

export function shuffle<T>(arr: T[]): T[] {
	let i = arr.length,
		j,
		temp;
	while (--i > 0) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}
