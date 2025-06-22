import { io } from 'socket.io-client';


const SOCKET_URL = 'http://localhost:3000'
class WSService {
    initializeSocket = async () => {
        try {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: false,
            });
            // console.log('initializing socket', this.socket);

            this.socket.on('connect', data => {
                console.log('socket connected');
            });
            this.socket.on('disconnect', data => {
                // console.log('socket yet not disconnected');
                // setTimeout(() => {
                console.log('socket disconnected');
                // }, 60000);
            });
            this.socket.on('error', data => {
                console.log('socket error');
            });
        } catch (error) {
            console.log('socket is not initailized', error);
        }
    };
    emit(event, data = {}, res) {
        this.socket.emit(event, data, res);
    }
    timeoutEmit(event, data, callback, timeout) {
        this.socket.timeout(timeout).emit(event, data, callback);
    }
    on(event, cb) {
        this.socket.on(event, cb);
    }
    volatile(event, data, cb) {
        this.socket.volatile.emit(event, data, cb);
    }
    off(event) {
        this.socket.off(event);
    }
    removeListener(listenerName) {
        this.socket.removeListener(listenerName);
    }
}

const socketServices = new WSService();
export default socketServices;
