"use client";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
interface iSocketContext {

}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = async ({ children }: { children: React.ReactNode }) => {

    const user = await getCurrentUser();


    const [socket, setSocket] = useState<Socket | null>(null);

    const [isSocketConnected, setIsSocketConnected] = useState(false);

    // Initialize socket
    useEffect(() => {
        const socket = io();
        setSocket(socket);

        return () => {
            socket.disconnect();
        }
    }, [user]);

    useEffect(() => {
        if (socket === null) return;

        if(socket.connected) {
            onConnect();
        } 

        function onConnect() {
            setIsSocketConnected(true);
        }

        function onDisconnect() {
            setIsSocketConnected(false);
        }

        socket.on("connect", onConnect);   
        socket.on("disconnect", onDisconnect);


        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        }
    }, [socket]);

    return <SocketContext.Provider value={{}}>
        {children}
    </SocketContext.Provider>
}


export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("Socket not found");
    return context;
}