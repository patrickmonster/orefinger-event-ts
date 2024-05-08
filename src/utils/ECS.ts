/**
 * ECS 컨테이너 정보를 불러오거나, 불러올 수 없는 경우에 대한 처리를 담당하는 모듈입니다.
 */

import axios from 'axios';

import { ecsSet } from 'controllers/log';
import { ECStask } from 'interfaces/ecs';
/**
 * ECS 컨테이너 정보를 불러옵니다.
 */
export const createECSState = async () => {
    if (process.env.ECS_CONTAINER_METADATA_URI) {
        const { ECS_CONTAINER_METADATA_URI } = process.env;
        console.log(`ECS: ${ECS_CONTAINER_METADATA_URI}`);
        await axios
            .get<ECStask>(`${ECS_CONTAINER_METADATA_URI}/task`)
            .then(async ({ data }) => {
                const { Family, Revision, TaskARN } = data;
                const [, name, id] = TaskARN.split('/');
                const { insertId } = await ecsSet(id, Revision, Family);

                console.log(`ECS STATE ::`, data.Containers, insertId);
                process.env.ECS_ID = id;
                process.env.ECS_REVISION = Revision;
                process.env.ECS_FAMILY = Family;
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
