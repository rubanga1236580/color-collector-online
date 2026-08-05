import { Server } from "http";
import { WebSocketServer } from "ws";

let wss: WebSocketServer;

export function createWebSocket(server: Server) {
  wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket) => {
    console.log("[WS] Client Connected");

    socket.on("close", () => {
      console.log("[WS] Client Disconnected");
    });
  });
}

export function getWebSocketServer() {
  return wss;
}
