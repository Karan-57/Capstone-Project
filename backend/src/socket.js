const { Server } = require('socket.io');

let io = null;

/**
 * Initializes Socket.io with the HTTP server
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Determine userId from handshake auth or query params
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket] User ${userId} joined room ${userId}`);
    }

    // Allow manual join to room via 'join' event
    socket.on('join', (data) => {
      const roomUserId = typeof data === 'object' ? data?.userId : data;
      if (roomUserId) {
        socket.join(roomUserId.toString());
        console.log(`[Socket] Socket ${socket.id} joined user room ${roomUserId}`);
      }
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  });

  return io;
}

/**
 * Returns the current Socket.io instance
 * @returns {Server|null}
 */
function getIO() {
  return io;
}

/**
 * Checks if a specific user currently has active socket connections
 * @param {string} userId
 * @returns {boolean}
 */
function isUserOnline(userId) {
  if (!io || !userId) return false;
  const room = io.sockets.adapter.rooms.get(userId.toString());
  return !!(room && room.size > 0);
}

module.exports = {
  initSocket,
  getIO,
  isUserOnline,
};
