import { io } from 'socket.io-client';

const SOCKET_URL = 'https://safevoice2-heuo.vercel.app';

export const initSocket = () => {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });
};