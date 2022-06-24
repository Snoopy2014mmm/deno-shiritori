import {firstWord} from "../scripts/firstWord.ts";
import { lastIsFirst, lastIsん } from "../scripts/checkShiritoriRole.ts"

let previousWord = "";
let words: string[] = [];

function response(): Response {
    return new Response(JSON.stringify({
        previousWord: previousWord,
        words: words
    }));
}

function duplicateWord(nextWord: string): boolean {
    return words.includes(nextWord);
}

export async function singleRoute(req: Request): Promise<Response> {
    if (req.method === 'GET') {
        return response();
    }

    if (req.method === 'POST') {
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord;

        if (!lastIsFirst(previousWord, nextWord)) {
            return new Response("前の単語に続いていません．", {status: 400});
        }

        if (lastIsん(nextWord)) {
            return new Response("「ん」でおわったので負け", {status: 400});
        }

        if (duplicateWord(nextWord)) {
            return new Response("おなじ単語は使わないで", { status: 400});
        }

        previousWord = nextWord;
        words.push(previousWord);
        return response();
    }

    if (req.method === 'DELETE') {
        previousWord = firstWord();
        words = [previousWord];
        return response();
    }

    return new Response(null, {status: 404});
}