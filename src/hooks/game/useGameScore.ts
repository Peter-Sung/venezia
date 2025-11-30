import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameStore, formatTime } from '../../store/gameStore';
import { fetchRankings, updateHighScore, logGameResult } from '../../lib/queries';
import { GameSession } from '../../domains/game/session';

export const useGameScore = (session: GameSession) => {
    const queryClient = useQueryClient();
    const store = useGameStore();
    const [isNewRecord, setIsNewRecord] = useState(false);

    const { mutate: submitScore, isSuccess: isScoreSubmitSuccess } = useMutation({
        mutationFn: async ({ nickname, play_at, score, playerId }: { nickname: string; play_at: string; score: number; playerId: string }) => {
            // 1. 현재 최고 기록 조회
            const { myBest } = await fetchRankings(nickname);
            const previousBest = myBest?.score || 0;
            const isRecord = score > previousBest;

            // 2. 게임 결과 로그 저장 (모든 게임)
            await logGameResult({ playerId, score, playAt: play_at });

            // 3. 최고 점수 업데이트 (기존보다 높을 때만 DB 업데이트되지만, RPC가 알아서 처리함)
            // 다만 여기서는 'New Record' 배지를 위해 우리가 직접 비교했습니다.
            await updateHighScore({ nickname, play_at, score });

            return isRecord;
        },
        onSuccess: (isRecord) => {
            setIsNewRecord(isRecord);
            queryClient.invalidateQueries({ queryKey: ['rankings'] });
        },
    });

    // --- Game Over Handler ---
    useEffect(() => {
        if (store.gameStatus === 'gameOver') {      // 게임 결과 로깅 및 점수 제출
            // 게스트인 경우(playerId가 없는 경우)에는 점수 저장을 건너뛰거나 로컬에만 저장할 수 있음
            // 현재 요구사항은 "기존 동작 유지"이므로 playerId가 있을 때만 저장
            if (session?.playerId) {
                submitScore({
                    nickname: session.nickname,
                    play_at: formatTime(store.totalPlayTime),
                    score: store.score,
                    playerId: session.playerId,
                });
            }
        }
    }, [store.gameStatus, session?.nickname, session?.playerId, store.totalPlayTime, store.score, submitScore]);

    return {
        isScoreSubmitSuccess: isScoreSubmitSuccess || (!session.playerId && store.gameStatus === 'gameOver'), // Guest always succeeds locally
        isNewRecord,
    };
};
