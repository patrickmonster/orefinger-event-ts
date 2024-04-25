/**
 * ECS 컨테이너 정보를 불러오거나, 불러올 수 없는 경우에 대한 처리를 담당하는 모듈입니다.
 */

import axios from 'axios';
import { ecsSet } from 'controllers/log';
import { ECStask } from 'interfaces/ecs';
import { REDIS_KEY, getInstance } from './redis';

/**
 * ECS 컨테이너 정보를 불러옵니다.
 */
export const createECSState = async () => {
    if (process.env.ECS_CONTAINER_METADATA_URI) {
        const { ECS_CONTAINER_METADATA_URI } = process.env;
        console.log(`ECS: ${ECS_CONTAINER_METADATA_URI}`);
        axios
            .get<ECStask>(`${ECS_CONTAINER_METADATA_URI}/task`)
            .then(async ({ data }) => {
                const { Family, Revision, TaskARN } = data;
                const [, name, id] = TaskARN.split('/');

                console.log(`ECS STATE ::`, data.Containers);
                process.env.ECS_ID = id;
                process.env.ECS_REVISION = Revision;
                process.env.ECS_FAMILY = Family;

                const { insertId } = await ecsSet(id, Revision, Family);
                console.log(`ECS SET ::`, insertId);

                process.env.ECS_PK = `${insertId}`;
            })
            .catch(e => {
                console.error(`ECS STATE ERROR ::`, e);
            });

        return true;
    } else {
        console.log('ECS_CONTAINER_METADATA_URI is not defined');

        return false;
    }
};

const serverECS: {
    [key: string]: {
        count: number;
        userCount: number;
    };
} = {};

/**
 * ECS 정보를 수신합니다
 * @returns ECS ID
 */
getInstance()
    .subscribe(REDIS_KEY.SUBSCRIBE.ECS_CHAT_STATE('channels'), (message: string) => {
        const { id, revision, count, userCount } = JSON.parse(message);
        if (revision !== process.env.ECS_REVISION) return;

        serverECS[id] = { count, userCount };
    })
    .catch(console.error);

/**
 * ECS 에서 가장 적은 공간을 찾아서 반환합니다.
 * @returns
 */
export const getECSSpaceId = async () => {
    // ECS 정보를 불러옵니다.
    const list = Object.keys(serverECS).map(key => {
        return {
            id: key,
            ...serverECS[key],
        };
    });

    const target = list.reduce(
        (prev, curr) => {
            if (prev.userCount > curr.userCount) return curr;
            return prev;
        },
        { count: 9999999, userCount: 9999999, id: '' }
    );

    if (target.id != '') return target.id;
    else return '0';
};
