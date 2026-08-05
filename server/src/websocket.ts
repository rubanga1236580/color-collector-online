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

export function broadcast(data: unknown) {
  if (!wss) {
    return;
  }

  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}
