import upgradeWebSocket = Deno.upgradeWebSocket
import { createRoom } from "./double.ts"

let passwords: string[] = [];
let websockets: WebSocket[] = [];

function waitIn(ws: WebSocket, password: string) {
    websockets.push(ws);
    passwords.push(password);
}

function waitOutByPassword(password: string) {
    const i = passwords.indexOf(password);
    websockets.splice(i, 1);
    passwords.splice(i, 1);
}

function waitOutByWS(ws: WebSocket) {
    const i = websockets.indexOf(ws);
    passwords.splice(i, 1);
    websockets.splice(i, 1);
}

export async function waitingRoute(req: Request): Promise<Response> {

    if (req.method === 'GET') {
        let response, socket: WebSocket;
        try {
            ({ response, socket } = upgradeWebSocket(req));
        } catch {
            return new Response("request isn't trying to upgrade to websocket.");
        }
        socket.onopen = () => console.log("socket opened");
        socket.onmessage = (e) => {
            const password = e.data;
            if (passwords.includes(password)) {
                const room = createRoom();
                const index = passwords.indexOf(password);
                socket.send(JSON.stringify({roomId: room.roomId, playerId: room.player1}));
                websockets[index].send(JSON.stringify({roomId: room.roomId, playerId: room.player2}));
                waitOutByPassword(password);
            }
            waitIn(socket, password);
            console.log("socket message:", e.data);
            console.log(passwords);
        };
        socket.onerror = (e) => console.log("socket errored:", e);
        socket.onclose = () => {
            waitOutByWS(socket);
            console.log(passwords);
            console.log("socket closed");
        }
        return response;
    }

    return new Response(null, {status: 404});
}