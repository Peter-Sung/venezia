import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRankingsByPeriod, fetchUserRank, fetchScoreRank } from '../lib/queries';

type Period = 'weekly' | 'monthly' | 'all_time';

interface RankingBoardProps {
    myPlayerId?: number;
    currentScore?: number;
    myNickname?: string;
}

const RankingBoard: React.FC<RankingBoardProps> = ({ myPlayerId, currentScore, myNickname }) => {
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
        if (!rankings || rankings.length === 0) return <div style={{ textAlign: 'center', padding: '20px' }}>랭킹 데이터가 없습니다.</div>;

        // Helper to format date as YYYY/MM/DD
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        };

        // Determine if we are in "Game Over" mode (currentScore provided) or "View Ranking" mode
        const isGameOverMode = currentScore !== undefined;

        // Check if current score is in Top 10 (only for Game Over mode)
        // We match by score and nickname.
        const currentScoreInTop10Index = isGameOverMode && rankings
            ? rankings.findIndex((r: any) => r.score === currentScore && r.nickname === myNickname)
            : -1;
        const isCurrentScoreInTop10 = currentScoreInTop10Index !== -1;

        // Check if "My Best" is in Top 10 (for View Ranking mode)
        const isMyBestInTop10 = !isGameOverMode && myRankData && myRankData.rank <= 10;

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
                        {rankings.map((rank: any, index: number) => {
                            // Highlight logic:
                            // If Game Over mode: Highlight if this row is the current score.
                            // If View Ranking mode: Highlight if this row is my best score (optional, but good UX).

                            let isHighlight = false;
                            if (isGameOverMode) {
                                isHighlight = index === currentScoreInTop10Index;
                            } else {
                                // For View Ranking, we can try to match nickname if we don't have ID in list
                                isHighlight = rank.nickname === myNickname;
                            }

                            return (
                                <tr key={`${rank.nickname}-${index}`} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px', textAlign: 'center', width: columnWidths.rank }}>{index + 1}</td>
                                    <td style={{ padding: '8px', textAlign: 'left', width: columnWidths.nickname, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <span style={{ color: isHighlight ? 'blue' : 'inherit' }}>
                                            {rank.nickname}
                                            {isHighlight && <span style={{ color: 'red', marginLeft: '4px' }}>(Now)</span>}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', width: columnWidths.score }}>
                                        <span style={{ color: isHighlight ? 'blue' : 'inherit' }}>{rank.score.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9em', color: '#666', width: columnWidths.date }}>
                                        {formatDate(rank.played_at)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Bottom Section Logic */}
                {/* Case 1: Game Over Mode AND Current Score NOT in Top 10 -> Show Current Score */}
                {isGameOverMode && !isCurrentScoreInTop10 && currentScoreRank && (
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

                {/* Case 2: View Ranking Mode AND My Best NOT in Top 10 -> Show My Best Score */}
                {!isGameOverMode && myPlayerId && myRankData && !isMyBestInTop10 && (
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
