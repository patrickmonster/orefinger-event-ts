import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType } from 'discord-api-types/v10';

export type ResultType = string | number | boolean;

const getOptions = <T extends ResultType>(options: APIApplicationCommandInteractionDataOption[] | undefined, id: string, defaultValue?: T): T => {
    if (options == undefined) {
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`옵션 ${id}를 찾을 수 없고 기본값도 제공되지 않았습니다.`);
    }

    for (const option of options) {
        switch (option.type) {
            case ApplicationCommandOptionType.Subcommand:
            case ApplicationCommandOptionType.SubcommandGroup:
                if (!option.options) continue;
                const result: T = getOptions<T>(option.options, id, defaultValue);
                if (result !== undefined) return result;
                break;
            default:
                if (option.name === id) return option.value as T;
                break;
        }
    }

    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`옵션 ${id}를 찾을 수 없습니다.`);
};

export default getOptions;

export const getSubcommand = (
    options: APIApplicationCommandInteractionDataOption[] | undefined,
    id: string
): APIApplicationCommandInteractionDataOption | undefined => {
    if (options == undefined) return undefined;

    for (const option of options) {
        switch (option.type) {
            case ApplicationCommandOptionType.Subcommand:
                if (option.name === id) return option;
                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                if (!option.options) continue;
                const result = getSubcommand(option.options, id);
                if (result !== undefined) return result;
                break;
            default:
                break;
        }
    }

    return undefined;
};
