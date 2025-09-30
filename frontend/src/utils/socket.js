import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const initSocket = () => {
  return io(SOCKET_URL);
};