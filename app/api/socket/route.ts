import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

// Store connected users
const users = new Map();

// Initialize Socket.IO server
const initSocketServer = () => {
  // Check if socket server is already initialized
  if ((global as any).io) {
    return (global as any).io;
  }

  const io = new Server({
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Handle client connection
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Store user connection
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      users.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from connected users
      if (userId) {
        users.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  // Save the socket server in global object
  (global as any).io = io;
  return io;
};

// Initialize the socket server immediately when this module is imported
const io = initSocketServer();

// Helper function to send notification to a specific user
export const sendNotificationToUser = (userId: string, notification: any) => {
  const io = (global as any).io;
  if (!io) return;
  
  const socketId = users.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    return true;
  }
  return false;
};

// Helper function to send application status update
export const sendApplicationStatusUpdate = (userId: string, data: {
  applicationId: string;
  status: 'approved' | 'rejected';
  message: string;
}) => {
  const io = (global as any).io;
  if (!io) return;
  
  const socketId = users.get(userId);
  if (socketId) {
    io.to(socketId).emit('application_status_update', data);
    return true;
  }
  return false;
};

export function GET() {
  // Initialize the socket server
  const io = initSocketServer();
  
  return new NextResponse('Socket server is running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 