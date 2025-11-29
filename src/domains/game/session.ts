export interface GameSession {
    playerId?: string; // Optional for guest users
    nickname: string;
    isGuest: boolean;
}
