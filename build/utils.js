export const HTML = {
    getOne(selectors, base = document.body) {
        return base.querySelector(selectors);
    },
    getAll(selectors, base = document.body) {
        return Array.from(base.querySelectorAll(selectors));
    },
};
export function shuffle(arr) {
    let i = arr.length, j, temp;
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
