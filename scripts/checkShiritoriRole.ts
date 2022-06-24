export function lastIsFirst(previousWord: string, nextWord: string): boolean {
    return nextWord.length > 0 && previousWord.charAt(previousWord.length - 1) === nextWord.charAt(0);
}

export function lastIsん(nextWord: string): boolean {
    return nextWord.charAt(nextWord.length-1) === 'ん';
}