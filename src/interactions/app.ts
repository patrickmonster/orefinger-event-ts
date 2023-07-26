import { InteractionEvent, APIApplicationCommandInteraction, APIApplicationCommandInteractionData } from 'interfaces/interaction';

import autoLoader from 'utils/auto-command';

const options = {
    pathTag: ' ',
};

autoLoader(__filename, options).then(dirs => {
    console.log(`
경로탐색(${dirs.length}개)
${dirs.map(({ path, name, ext }) => `${path || ''} ${name}${ext}`).join('\n')}
    `);
});

export type appInteraction = InteractionEvent & Omit<APIApplicationCommandInteraction, 'data'> & APIApplicationCommandInteractionData;

const appComponent = async (interaction: appInteraction) => {
    // ??
};

export default appComponent;
