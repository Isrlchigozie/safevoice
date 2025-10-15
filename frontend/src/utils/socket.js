import { io } from 'socket.io-client';

const SOCKET_URL = 'https://safevoice2-heuo.vercel.app';

export const initSocket = () => {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    timeout: 1000,
  });
};