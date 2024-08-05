/**
 * @description Interval utility functions
 * @fileoverview Interval utility functions
 * @module utils/interval
 * @requires NodeJS
 * @requires NodeJS.Timeout
 *
 */

const loops: Array<NodeJS.Timeout> = [];

export const createInterval = (time: number, fn: () => void) => {
    const loop = setInterval(fn, time);
    loops.push(loop);
    return loop;
};

export const clearIntervals = () => {
    loops.forEach(loop => {
        try {
            clearInterval(loop);
        } catch (e) {}
    });
};

process.on('exit', clearIntervals);
