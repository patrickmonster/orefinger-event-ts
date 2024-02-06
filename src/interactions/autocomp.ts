import {
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataStringOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
} from 'discord-api-types/v10';
import { APIChatInputApplicationCommandInteractionData } from 'plugins/discord';
import { getChzzkAPI } from 'utils/naverApiInstance';

import { searchChzzkUser } from 'components/chzzkUser';

const chzzk = getChzzkAPI('v1');

type FocusedType =
    | APIApplicationCommandInteractionDataNumberOption
    | APIApplicationCommandInteractionDataStringOption
    | APIApplicationCommandInteractionDataIntegerOption;

const getInputItems = (options: APIApplicationCommandInteractionDataOption[]): FocusedType[] | undefined => {
    return options?.reduce((acc, cur) => {
        if ([10, 3, 4].includes(cur.type)) {
            acc.push(cur as FocusedType);
        } else {
            const data = getInputItems(
                (
                    cur as
                        | APIApplicationCommandInteractionDataSubcommandOption
                        | APIApplicationCommandInteractionDataSubcommandGroupOption
                ).options || []
            );
            if (data) acc.push(...data);
        }
        return acc;
    }, [] as FocusedType[]);

    // APIApplicationCommandInteractionDataNumberOption | APIApplicationCommandInteractionDataStringOption | APIApplicationCommandInteractionDataIntegerOption
};

const autoComponent = async (
    interaction: APIChatInputApplicationCommandInteractionData,
    replay: (data: Array<{ name: string; value: string }>) => void
) => {
    // 자동완성
    const { options } = interaction;

    const item = getInputItems(options || [])?.find(item => item.focused);

    if (!item) return;

    switch (item.name) {
        case '치지직': {
            replay(await searchChzzkUser(`${item.value}`));
            break;
        }
    }
};

export default autoComponent;
