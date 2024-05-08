import Client from 'socket.io-client';

const socket = Client(`http://localhost:3001`);

let init = false;

/**
 * ECS 소켓 초기화
 */
socket.on('init', data => {
    console.log('ECS socket init :: ', data);
    const { id, revision, family, pk, rownum } = data;

    process.env.ECS_ID = id;
    process.env.ECS_REVISION = revision;
    process.env.ECS_FAMILY = family;
    process.env.ECS_PK = pk;
    process.env.ECS_ROWNUM = rownum;

    init = true;
});

export const isInit = () => init;

export default socket;

////////////////////////////////////////////////////////////////////////////////////////
