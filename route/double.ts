import { firstWord } from "../scripts/firstWord.ts"

const rooms: { roomId: string, player1: string, socket1?: WebSocket, nextIs1: boolean, player2: string, socket2?: WebSocket, records: string[]}[] = []
import upgradeWebSocket = Deno.upgradeWebSocket
import { lastIsFirst, lastIsん } from "../scripts/checkShiritoriRole.ts"

function roomIn(roomId: string, playerId: string, socket: WebSocket) {
    const room = rooms.find(v => v.roomId === roomId)
    if (room === undefined) throw new Error('部屋がありません')
    if (room.player1 === playerId) {
        room.socket1 = socket
    } else if (room.player2 === playerId) {
        room.socket2 = socket
    } else {
        throw new Error('player idが違います')
    }
}

function sendStatus(roomId: string) {
    const room = rooms.find(v => v.roomId === roomId);
    if (room === undefined) throw new Error('部屋がない');

    room.socket1?.send(JSON.stringify({
        type: 'update',
        isMyTurn: room.nextIs1,
        records: room.records
    }))
    room.socket2?.send(JSON.stringify({
        type: 'update',
        isMyTurn: !room.nextIs1,
        records: room.records
    }))
}

function sendFinish(roomId: string, isWinner1: boolean, reason: string) {
    const room = rooms.find(v => v.roomId === roomId);
    if (room === undefined) throw new Error('部屋がない');

    room.socket1?.send(JSON.stringify({
        type: 'finish',
        result: isWinner1 ? 'あなたの勝ち' : 'あなたの負け',
        reason: reason
    }))
    room.socket2?.send(JSON.stringify({
        type: 'finish',
        result: isWinner1 ? 'あなたの負け' : 'あなたの勝ち',
        reason: reason
    }))
}

function shout(roomId: string, playerId: string, content: string) {
    const room = rooms.find(v => v.roomId === roomId);
    if (room === undefined) throw new Error('部屋がない');
    if (lastIsん(content)) sendFinish(roomId, !room.nextIs1, 'んがついたので')
    if (!lastIsFirst(room.records[room.records.length - 1], content)) sendFinish(roomId, !room.nextIs1, '続いていないので')
    if (room.records.includes(content)) sendFinish(roomId, !room.nextIs1, '同じ単語を使ったので')
    room.records.push(content)
    room.nextIs1 = !room.nextIs1
}

export function createRoom(): { roomId: string, player1: string, player2: string } {
    const room = {
        roomId: crypto.randomUUID(),
        nextIs1: true,
        player1: crypto.randomUUID(),
        player2: crypto.randomUUID(),
        records: [firstWord()]
    }
    rooms.push(room)
    return room
}

export async function doubleRoute(req: Request): Promise<Response> {

    if (req.method === 'GET') {
        let response, socket: WebSocket;
        try {
            ({ response, socket } = upgradeWebSocket(req));
        } catch {
            return new Response("request isn't trying to upgrade to websocket.");
        }
        socket.onopen = () => console.log("socket opened");
        socket.onmessage = (e) => {
            const requestJson = JSON.parse(e.data);

            if (requestJson.type === 'setting') {
                roomIn(requestJson.roomId, requestJson.playerId, socket);
                sendStatus(requestJson.roomId);
                return;
            }

            if (requestJson.type === 'shout') {
                shout(requestJson.roomId, requestJson.playerId, requestJson.content);
                sendStatus(requestJson.roomId);
                return;
            }
        };
        socket.onerror = (e) => console.log("socket errored:", e);
        socket.onclose = () => {};
        return response;
    }

    return new Response(null, {status: 404});
}