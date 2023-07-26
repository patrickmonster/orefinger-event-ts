import { InteractionEvent, APIApplicationCommandInteraction } from 'interfaces/interaction';

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

export type appInteraction = InteractionEvent & APIApplicationCommandInteraction;

const appComponent = async (interaction: appInteraction) => {
    // interaction.
    await interaction.re({
        content: '테스트',
    });

    await interaction.follow({
        content: '후행',
    });

    setTimeout(async () => {
        await interaction
            .re({
                content: '대화바꿈!',
            })
            .catch(e => {
                console.error(e);
            });
    }, 1000 * 10);
};

export default appComponent;
