// src/config/socket.js

import { Server } from "socket.io"; // Core Socket.IO server
import { createAdapter } from "@socket.io/redis-adapter"; // Redis adapter for multi-instance sync
import { logger } from "./logger.js"; // Custom logger utility
import { redisClient } from "./redis.js"; // Redis client setup
import { socketController } from "../controllers/socketController.js";

let io; // Socket.IO instance (singleton pattern)

// Initialize Socket.IO with Redis adapter for horizontal scalability
export const initSocket = async (server) => {
  // Attach Socket.IO to HTTP server with CORS setup
  io = new Server(server, {
    cors: {
      origin: "*", // Should be restricted to frontend origin in production
      methods: ["GET", "POST"],
    },
  });

  // Setup Redis pub/sub clients
  const pubClient = redisClient; // Publisher
  const subClient = pubClient.duplicate(); // Subscriber (needed by socket.io)

  // Connect subscriber client
  await subClient.connect();

  // Use Redis adapter for syncing events across instances
  io.adapter(createAdapter(pubClient, subClient));

  // Handle socket connection
  io.on("connection", (socket) => {
    logger.info(`🟢 Socket connected: ${socket.id}`);

    // TODO: Add socket event listeners (join room, message, typing, etc.) here
    socketController({socket})

  });

  return io;
};

// Export current Socket.IO instance
export const getIO = () => {
  if (!io) {
    logger.error("❌ Socket.io not initialized");
    throw new Error("Socket.io not initialized");
  }
  return io;
};
