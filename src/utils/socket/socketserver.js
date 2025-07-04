import { io } from 'socket.io-client';

let user = localStorage.getItem('UserInfo')
user = JSON.parse(user)
let queryParams = { id: user?.user?.id }
const socket = io("http://localhost:3000", {
    transports: ['websocket'],
    forceNew: true,
    query: queryParams,
});

export { socket }
