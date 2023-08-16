import { tokens } from 'controllers/auth';
import menu from './menu';
import moment from 'moment';
import { APIActionRowComponent, APIStringSelectComponent } from 'discord-api-types/v10';

moment.locale('ko');

type result =
    | APIActionRowComponent<APIStringSelectComponent>[]
    | {
          type: number;
          user_id: string;
          auth_id: string;
          login: string;
          name: string;
          user_type: number;
          email: string;
          avatar: string;
          refresh_token: string;
          is_session: string;
          create_at: string;
          update_at: string;
      };

// APIActionRowComponent<APIMessageActionRowComponent>[]
export default (user_id: string, custom_id: string, ...types: number[]): Promise<result> => {
    return tokens(user_id, ...types).then(user => {
        switch (user.length) {
            case 0:
                throw new Error('Not found User');
            case 1:
                return user[0];
            default:
                return menu(
                    {
                        custom_id,
                        placeholder: '인증을 완료하실 계정을 선택 해 주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    ...user.map(({ user_id, login, name, create_at }) => ({
                        label: `${name}`,
                        value: user_id,
                        description: `${moment(create_at).format('YYYY년 MMM Do')} 인증됨`,
                    }))
                );
        }
    });
};
