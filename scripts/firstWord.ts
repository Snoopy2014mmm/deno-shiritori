const randomFirstWords = ["しりとり", "おせろ", "しちならべ", "るーれっと"];

export function firstWord() {
    const random = Math.floor(Math.random() * 4);
    return randomFirstWords[random];
}