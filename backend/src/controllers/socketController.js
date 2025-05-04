// src/controllers/socket.controller.js

import { logger } from "../config/logger.js";
import { getIO } from "../config/socket.js";
import { Message } from "../models/Message.js";
import { Room } from "../models/Room.js";

// Store mapping of userId to their socket.id FOR ONLINE USERS and socket.id to userId FOR SOCKET TO USER
// for multi device user support use set of socket.id for each user in online user
const onlineUsers = new Map();
const socketToUsers = new Map();  
export const socketController = ({ socket }) => {
  const io = getIO(); // Get the initialized Socket.IO instance
//   1.Emit a message to all clients:
//   io.emit("message", "Hello from the server!");
//   2.Broadcast to a specific room: 
//   io.to("room-id").emit("message", "Hello from the server!"); 
//   3.Sending messages to a specific user:
//   io.to(socketId).emit('message:send', data);

  // User joins the socket connection
  socket.on("user:join", ({ userId }) => {
    try {
      if ( !userId) {
        return socket.emit("error", { message: "User ID required" });
      }

      onlineUsers.set(userId, socket.id);
      socketToUsers.set(socket.id, userId);
      logger.info(`🟢 User joined: ${userId} with ${socket.id}`);
      socket.emit("user:joined", userId);
    } catch (err) {
      logger.error("[Socket] user:join error", err);
      socket.emit("error", { message: "Join error" });
    }
  });

  // User joins a chat room
  socket.on("room:join", async({ taskId }) => {
    try {
      const userId = socketToUsers.get(socket.id);
      if (!taskId || !userId) {
        return socket.emit("error", { message: "Task ID and User ID are required" });
      }

      const room = await Room.findOne({task:taskId})
  //  Convert userId to string for accurate comparison since its an Object
      if (!room) {
        logger.warn(`Room not found for taskId: ${taskId}`);
        return socket.emit("error", { message: "Room not found for this task" });
      }

     // Convert userId to string for accurate comparison
    const isAuthorized = room.members.some((memberId) => memberId.toString() === userId);
    if (!isAuthorized) {
      logger.warn(`❌ Unauthorized userId: ${userId} for taskId: ${taskId}`);
      return socket.emit("error", { message: "Unauthorized user" });
    }

    const roomId = room._id.toString(); // Always use string for room ID
    
    socket.join(roomId);
    
    logger.info(`✅ User ${userId} joined room ${roomId} with socket ${socket.id}`);
    socket.to(roomId).emit("room:joined", userId);

    } catch (err) {
      logger.error("[Socket] room:join error", err);
      socket.emit("error", { message: "Join room error" });
    }
  });

  // User sends a message
  socket.on("message:send", async(payload, callback) => {
    try {
      const { roomId, content,tempId } = payload;
      const senderId = socketToUsers.get(socket.id);
      if (!roomId || !senderId || !content || !content.trim()) {
        return socket.emit("error", { message: "Room ID, sender ID, and content are required" });
      }
      logger.info(`📨 Message sent: ${content}`);
      const message= await Message.create({
        room:roomId,
        sender:senderId,
        content,
        tempId:tempId,
        seenInfo:[{seenBy:senderId,seenAt:new Date()}],
      })
      if(!message)
      {
        return socket.emit("error-message-not-created", { message: "Message not created in db" });
      }
      // for message created and message sent to users but still not ddeliverd to user
      //  when users listen to recieve , change ui and message status with message delivered emit
      socket.to(roomId).emit("message:status:sent", message);
        callback({success:true},
            message,
        )
    } catch (err) {
      logger.error("[Socket] message:send error", err);
      callback({success:false},err.message)
      socket.emit("error", { message: "Message send error" });
      
    }
  });


  //  when message is delivered to users frontend and it sees and in return send message delivered emit
  socket.on("message:delivered", async(payload ) => {
    try {
      const { messageId } = payload;
      const senderId = socketToUsers.get(socket.id);
      if (!messageId || !senderId) {
        return socket.emit("error", { message: "Message ID and sender ID are required" });
      }
      logger.info(`📨 Message delivered: ${messageId}`);
      const message =await Message.findOneAndUpdate(
        { _id: messageId },
        {status:"delivered"},
        { new: true,runValidators: true },
      );
      if(!message)
      {
        return socket.emit("error-message-not-updated", { message: "Message not updated in db" });
      }
      socket.to(message.room.toString()).emit("message:status:delivered", message);
    } catch (err) {
      logger.error("[Socket] message:delivered error", err);
   
      socket.emit("error", { message: "Message delivered error" });
    }
  })

  socket.on("message:seen", async ({ messageId }) => {
    try {
      const userId = socketToUsers.get(socket.id);
      logger.info(`👁️  Message ${messageId} seen by user ${userId}`);
      // Update the message as "seen" in the database and add the user to `seenInfo`
      const message = await Message.findOneAndUpdate(
        { _id: messageId },
        {
          status: "seen", // Update status to "seen"
          $push: { seenInfo: { seenBy: userId, seenAt: new Date() } },
        },
        { new: true, runValidators: true },
      );
      if (!message) {
        return socket.emit("error-message-not-updated", { message: "Message not found or not updated" });
      }
      socket.to(message.room.toString()).emit("message:status:seen", message); // Notify room that the message has been seen
    } catch (err) {
      logger.error("[Socket] message:seen error", err); // Log the error that occurred
      socket.emit("error", { message: "Error updating message status" }); // Emit error response
    }
  });
  

  // User starts typing
  socket.on("user:typing", ({ userId, roomId }) => {
    try {
      logger.info(`✍️  User typing: ${userId} in room: ${roomId}`);
      socket.broadcast.to(roomId).emit("typing:start", userId);
    } catch (err) {
      logger.error("[Socket] typing:start error", err);
    }
  });

  // User stops typing
  socket.on("user:stopTyping", ({ userId, roomId }) => {
    try {
      logger.info(`🛑 User stopped typing: ${userId} in room: ${roomId}`);
      socket.broadcast.to(roomId).emit("typing:stop", userId);
    } catch (err) {
      logger.error("[Socket] typing:stop error", err);
    }
  });

  

  // User leaves a room
  socket.on("room:leave", ({ userId, roomId }) => {
    try {
      socket.leave(roomId);
      logger.info(`🚪 User left room: ${userId} with socket ${socket.id}`);
      socket.broadcast.to(roomId).emit("room:left", userId);
    } catch (err) {
      logger.error("[Socket] room:leave error", err);
    }
  });

  // User disconnects from socket
  socket.on("disconnect", () => {
    try {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user:offline", { userId });
          logger.info(`🔴 User ${userId} disconnected`);
          break;
        }
      }
      for (const [sockId, userId] of socketToUsers.entries()) {
        if (sockId === socket.id) {
          socketToUsers.delete(sockId);
          socket.broadcast.emit("userDuplicateData:offline", { userId });
          logger.info(`🔴 User duplicate data ${userId} disconnected`);
          break;
        }
      }
    } catch (err) {
      logger.error("[Socket] disconnect error", err);
    }
  });
};
