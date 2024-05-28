import Client from 'socket.io-client';
import { CLIENT_EVENT, SERVER_EVENT } from './socketInterface';

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

export const clientEmit = (event: keyof typeof CLIENT_EVENT, ...args: any[]) => {
    socket.emit(event, ...args);
};

export const addEvent = (event: keyof typeof SERVER_EVENT, callback: (...args: any[]) => void) => {
    socket.on(event, callback);
};

export const isInit = () => init;

////////////////////////////////////////////////////////////////////////////////////////
