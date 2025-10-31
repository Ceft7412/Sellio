import {
  useContext,
  createContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  userId: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  userId,
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(
      process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        transports: ["websocket"],
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket");
      // Join user to their room
      if (userId) {
        socket.emit("join", userId);
        console.log(`📨 Joined room for user ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket; // Return null if not connected (don't throw error)
};
