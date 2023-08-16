import { APIEmbed } from 'discord-api-types/v10';
import { error } from 'utils/errorLog';

type ErrorEmbed = {
    title?: string;
    description?: string;
    target: string;
};
/**
 * 에러를 임베드로 만들어 반환합니다.
 */
export default (error_code: string, e: ErrorEmbed): APIEmbed => {
    try {
        error(error_code, `${e.target}]${e.title}\n${e.description}`);
    } catch (e) {}

    return {
        title: e.title || '오류가 발생했습니다.',
        description: e.description || '관리자에게 문의해주세요.',
        color: 0xff0000,
        fields: [
            {
                name: '오류 코드',
                value: `${error_code}`,
            },
            {
                name: '오류 위치',
                value: `${e.target}`,
            },
        ],
    };
};
