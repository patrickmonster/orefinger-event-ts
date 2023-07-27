/**
 *
 * @param {array} l 리스트
 * @param {integer} n
 * @returns
 */
export default function division<T>(l: T[], n: number): T[][] {
    const arr = l;
    const len = arr.length;
    const cnt = Math.floor(len / n);
    const tmp: T[][] = [];

    for (let i = 0; i <= cnt; i++) {
        tmp.push(arr.splice(0, n));
    }

    return tmp;
}
