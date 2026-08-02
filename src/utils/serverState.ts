import { createInterval } from './inteval';

export let lastServerRequset = 0;

let serverRequset = 0;
export const addServerRequest = () => serverRequset++;

createInterval(1000 * 60, () => {
    lastServerRequset = serverRequset;
    serverRequset = 0;
});
