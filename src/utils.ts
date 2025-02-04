export const HTML = {
	getOne<T extends HTMLElement>(selectors: string, base = document.body) {
		return base.querySelector(selectors) as T | null;
	},
	getAll<T extends HTMLElement>(selectors: string, base = document.body) {
		return Array.from(base.querySelectorAll(selectors)) as T[];
	},
};
