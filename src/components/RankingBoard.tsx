import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRankingsByPeriod } from '../lib/queries';

type Period = 'weekly' | 'monthly' | 'all_time';

const RankingBoard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Period>('weekly');

    const { data: rankings, isLoading, error } = useQuery({
        queryKey: ['rankings', activeTab],
        queryFn: () => fetchRankingsByPeriod(activeTab),
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleTabClick = (period: Period) => {
        setActiveTab(period);
    };

    const renderRankings = () => {
        if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>;
        if (error) return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>랭킹을 불러오는데 실패했습니다.</div>;
        if (!rankings || rankings.length === 0) return <div style={{ textAlign: 'center', padding: '20px' }}>랭킹 데이터가 없습니다.</div>;

        return (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-text-default)' }}>
                            <th style={{ padding: '8px', textAlign: 'center', width: '15%' }}>순위</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>닉네임</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>점수</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((rank: any, index: number) => (
                            <tr key={`${rank.nickname}-${index}`} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{rank.nickname}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{rank.score.toLocaleString()}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9em', color: '#666' }}>
                                    {new Date(rank.played_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
