export const bootTime = Date.now();

export let serverRequset = 0;
export const addServerRequest = () => serverRequset++;

const timmer = setInterval(() => {
    serverRequset = 0;
}, 1000 * 60);

process.on('SIGINT', () => {
    timmer && clearInterval(timmer);
});
