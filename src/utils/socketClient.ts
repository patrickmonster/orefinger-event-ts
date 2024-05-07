import Client from 'socket.io-client';

const socket = Client(`http://localhost:3001`);

socket.on('connect', () => {
    console.log('SOCKET] CONNECTED');
});

socket.on('disconnect', () => {
    console.log('SOCKET] DISCONNECTED');
});

socket.on('status', (data: any) => {
    console.log('SOCKET] STATUS', data);
});

export default socket;

////////////////////////////////////////////////////////////////////////////////////////

export const log = (...args: any[]) => {
    socket.emit('log', ...args);
};

export const LiveState = (state: 'change' | 'offline' | 'online', target: 'chzzk' | 'afreeca', data: any) => {
    socket.emit('liveState', {
        ...data,
        state,
        target,
    });
};

export const Chat = (data: { state: 'leave' | 'join' | 'change' | 'message'; target: 'ecs' | 'state'; data: any }) => {
    socket.emit('chat', data);
};
