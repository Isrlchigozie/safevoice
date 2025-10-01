import { io } from 'socket.io-client';

const SOCKET_URL = 'https://safevoice2.onrender.com';

export const initSocket = () => {
  return io(SOCKET_URL);
};