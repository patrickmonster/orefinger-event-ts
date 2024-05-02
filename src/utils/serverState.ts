import { createInterval } from './inteval';

export const bootTime = Date.now();

export let lastServerRequset = 0;

let serverRequset = 0;
export const addServerRequest = () => serverRequset++;

createInterval(() => {
    lastServerRequset = serverRequset;
    serverRequset = 0;
}, 1000 * 60);
