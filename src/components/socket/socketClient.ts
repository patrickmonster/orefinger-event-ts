import Client from 'socket.io-client';

const socket = Client(`http://localhost:3001`);

socket.on('connect', () => {
    console.log('socket connected');
});

socket.on('init', data => {
    const { id, revision, family, pk } = data;

    process.env.ECS_ID = id;
    process.env.ECS_REVISION = revision;
    process.env.ECS_FAMILY = family;
    process.env.ECS_PK = pk;
});

export default socket;

////////////////////////////////////////////////////////////////////////////////////////
