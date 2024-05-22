import Client from 'socket.io-client';

const socket = Client(`http://localhost:3001`);

let init = false;

export const ENV: {
    ECS_ID?: string;
    ECS_REVISION?: string;
    ECS_FAMILY?: string;
    ECS_PK?: string;
} = {};

/**
 * ECS 소켓 초기화
 */
socket
    .on('init', data => {
        console.log('ECS socket init :: ', data);
        const { id, revision, family, pk } = data;

        process.env.ECS_ID = id;
        process.env.ECS_REVISION = revision;
        process.env.ECS_FAMILY = family;
        process.env.ECS_PK = pk;

        ENV.ECS_ID = id;
        ENV.ECS_REVISION = revision;
        ENV.ECS_FAMILY = family;
        ENV.ECS_PK = pk;

        init = true;
    })
    .on('pingServer', () => {
        socket.emit('pongServer', process.env.ECS_PK);
    });

socket.emit('requestInit');

export const isInit = () => init;

export default socket;

////////////////////////////////////////////////////////////////////////////////////////
