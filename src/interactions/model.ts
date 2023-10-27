import { APIModalSubmission, APIModalSubmitInteraction, IReply } from 'plugins/discord';

import { join } from 'path';
import autoLoader from 'utils/autoCommand';
import { getCommand } from 'utils/interaction';

export type ModelInteraction = IReply & Omit<APIModalSubmitInteraction, 'data' | 'type'> & APIModalSubmission;

const [models] = autoLoader(join(__dirname, 'model'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: true,
});

const modelComponents = getCommand<ModelInteraction, string | Record<string, string>>(models);

const modelComponent = async (interaction: ModelInteraction) => {
    const { custom_id, components } = interaction;
    const id = custom_id.startsWith('4866') ? custom_id.substring(4) : custom_id;

    const values = components?.reduce((acc, { components }) => {
        components?.forEach(({ custom_id, value }) => (acc[custom_id] = value));
        return acc;
    }, {} as Record<string, string>);
    console.log('modelComponent', interaction.custom_id, values);

    const modelCommand = modelComponents.find(module => id.startsWith(module[0]));
    if (modelCommand) {
        const [name, exec] = modelCommand;
        await exec(interaction, values, ...id.substring(name.length + 1).split(' '));
    } else {
        console.log('Component: ', custom_id, 'is not registered.');
        await interaction.reply({ content: '해당 모달은 등록하지 않은 모달 입니다.' });
    }
};

export default modelComponent;
