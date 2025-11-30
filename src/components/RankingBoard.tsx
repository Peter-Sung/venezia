import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRankingsByPeriod, fetchUserRank, fetchScoreRank } from '../lib/queries';

type Period = 'weekly' | 'monthly' | 'all_time';

interface RankingBoardProps {
    myPlayerId?: number;
    currentScore?: number;
    myNickname?: string;
    isNewRecord?: boolean;
}

const RankingBoard: React.FC<RankingBoardProps> = ({ myPlayerId, currentScore, myNickname, isNewRecord }) => {
    const [activeTab, setActiveTab] = useState<Period>('weekly');

    const { data: rankings, isLoading, error } = useQuery({
        queryKey: ['rankings', activeTab],
        queryFn: () => fetchRankingsByPeriod(activeTab),
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: myRankData } = useQuery({
        queryKey: ['myRank', activeTab, myPlayerId],
        queryFn: () => fetchUserRank(activeTab, myPlayerId!),
        enabled: !!myPlayerId,
    });

    const { data: currentScoreRank, isLoading: isScoreRankLoading } = useQuery({
        queryKey: ['scoreRank', activeTab, currentScore],
        queryFn: () => fetchScoreRank(activeTab, currentScore!),
        enabled: currentScore !== undefined,
    });

    const handleTabClick = (period: Period) => {
        setActiveTab(period);
    };

    const renderRankings = () => {
        if (isLoading || isScoreRankLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>;
        if (error) return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>랭킹을 불러오는데 실패했습니다.</div>;

        // Determine if we are in "Game Over" mode
        const isGameOverMode = currentScore !== undefined;

        // Base rankings from DB (Top 10 unique users by best score)
        let displayRankings = rankings ? [...rankings] : [];
        let isCurrentInTop10 = false;

        // Logic:
        // 1. If isNewRecord: Update Top 10 with new score.
        // 2. If !isNewRecord: Keep Top 10 as is (showing old best).

        if (isGameOverMode && currentScore !== undefined && isNewRecord) {
            // 1. Remove the user's existing entry from the list (if any)
            const filteredRankings = displayRankings.filter((r: any) => r.nickname !== myNickname);

            // 2. Add the current score entry
            const currentScoreEntry = {
                nickname: myNickname,
                score: currentScore,
                played_at: new Date().toISOString(),
                isCurrent: true
            };
            filteredRankings.push(currentScoreEntry);

            // 3. Sort by score descending
            filteredRankings.sort((a: any, b: any) => b.score - a.score);

            // 4. Assign ranks
            const rankedList = filteredRankings.map((item: any, index: number) => ({
                ...item,
                rank: index + 1
            }));

            // 5. Check if current score is in Top 10
            const top10Virtual = rankedList.slice(0, 10);
            const foundInTop10 = top10Virtual.find((r: any) => r.isCurrent);

            if (foundInTop10) {
                displayRankings = top10Virtual;
                isCurrentInTop10 = true;
            } else {
                // If new record but not in Top 10, we revert to original list (or sorted original)
                displayRankings = rankings ? rankings.map((item: any, index: number) => ({ ...item, rank: index + 1 })) : [];
                isCurrentInTop10 = false;
            }
        } else {
            // Not a new record (or not game over mode)
            // Just show DB rankings
            displayRankings = displayRankings.map((item: any, index: number) => ({
                ...item,
                rank: index + 1
            }));
        }

        if (!rankings || rankings.length === 0 && !isGameOverMode) return <div style={{ textAlign: 'center', padding: '20px' }}>랭킹 데이터가 없습니다.</div>;

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        };

        const columnWidths = {
            rank: '15%',
            nickname: '45%',
            score: '20%',
            date: '20%',
        };

        return (
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-text-default)' }}>
                            <th style={{ padding: '8px', textAlign: 'center', width: columnWidths.rank }}>순위</th>
                            <th style={{ padding: '8px', textAlign: 'left', width: columnWidths.nickname }}>닉네임</th>
                            <th style={{ padding: '8px', textAlign: 'right', width: columnWidths.score }}>점수</th>
                            <th style={{ padding: '8px', textAlign: 'right', width: columnWidths.date }}>언제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRankings.map((rank: any, index: number) => {
                            const isCurrent = rank.isCurrent;
                            const isMyBest = !isGameOverMode && rank.nickname === myNickname;

                            return (
                                <tr key={`${rank.nickname}-${index}-${isCurrent ? 'now' : 'hist'}`} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px', textAlign: 'center', width: columnWidths.rank }}>{rank.rank}</td>
                                    <td style={{ padding: '8px', textAlign: 'left', width: columnWidths.nickname, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <span style={{ color: isCurrent ? 'blue' : 'inherit' }}>
                                            {rank.nickname}
                                            {isCurrent && <span style={{ color: 'red', marginLeft: '4px' }}>(New Record)</span>}
                                            {isMyBest && <span style={{ color: 'red', marginLeft: '4px' }}>(나)</span>}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', width: columnWidths.score }}>
                                        <span style={{ color: isCurrent ? 'blue' : 'inherit' }}>{rank.score.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9em', color: '#666', width: columnWidths.date }}>
                                        {formatDate(rank.played_at)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Bottom Section: Show if Game Over AND (Not in Top 10 OR Not New Record) */}
                {isGameOverMode && (!isCurrentInTop10 || !isNewRecord) && currentScoreRank && (
                    <div style={{ marginTop: '10px', borderTop: '2px solid #333', paddingTop: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'center', width: columnWidths.rank }}>{currentScoreRank}</td>
                                    <td style={{ padding: '8px', textAlign: 'left', width: columnWidths.nickname, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <span style={{ color: 'blue' }}>{myNickname} <span style={{ color: 'red' }}>(Now)</span></span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', width: columnWidths.score }}>
                                        <span style={{ color: 'blue' }}>{currentScore?.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9em', width: columnWidths.date }}>
                                        {formatDate(new Date().toISOString())}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {!isGameOverMode && myPlayerId && myRankData && myRankData.rank > 10 && (
                    <div style={{ marginTop: '10px', borderTop: '2px solid #333', paddingTop: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'center', width: columnWidths.rank }}>{myRankData.rank}</td>
                                    <td style={{ padding: '8px', textAlign: 'left', width: columnWidths.nickname, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <span style={{ color: 'red' }}>{myRankData.nickname} (나)</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', width: columnWidths.score }}>
                                        <span style={{ color: 'red' }}>{myRankData.score.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9em', width: columnWidths.date }}>
                                        {formatDate(myRankData.played_at)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                    className={`retro-button ${activeTab === 'weekly' ? 'bevel-inset' : 'bevel-outset'}`}
                    onClick={() => handleTabClick('weekly')}
                    style={{ flex: 1, fontWeight: activeTab === 'weekly' ? 'bold' : 'normal' }}
                >
                    최근 7일
                </button>
                <button
                    className={`retro-button ${activeTab === 'monthly' ? 'bevel-inset' : 'bevel-outset'}`}
                    onClick={() => handleTabClick('monthly')}
                    style={{ flex: 1, fontWeight: activeTab === 'monthly' ? 'bold' : 'normal' }}
                >
                    최근 30일
                </button>
                <button
                    className={`retro-button ${activeTab === 'all_time' ? 'bevel-inset' : 'bevel-outset'}`}
                    onClick={() => handleTabClick('all_time')}
                    style={{ flex: 1, fontWeight: activeTab === 'all_time' ? 'bold' : 'normal' }}
                >
                    전체
                </button>
            </div>

            <div className="bevel-inset" style={{ background: 'white', padding: '8px', minHeight: '200px' }}>
                {renderRankings()}
            </div>
        </div>
    );
};

export default RankingBoard;
