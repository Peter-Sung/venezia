import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsers } from '../../lib/queries';

interface AdminUser {
    id: string;
    nickname: string;
    created_at: string;
    drop_point: number;
    high_score: number;
    total_games: number;
    last_played_at: string;
    total_count: number;
}

const PAGE_SIZE = 20;

const ManageUsers: React.FC = () => {
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const { data: users, isLoading, error } = useQuery<AdminUser[], Error>({
        queryKey: ['adminUsers', page, sortColumn, sortDirection],
        queryFn: () => fetchAdminUsers(page, PAGE_SIZE, sortColumn, sortDirection),
        placeholderData: (previousData) => previousData,
    });

    const totalCount = users?.[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleSort = (column: string) => {
        if (column === 'nickname') return; // 닉네임은 정렬 대상에서 제외 요청됨

        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc'); // 새로운 컬럼은 기본적으로 내림차순
        }
    };

    const renderSortArrow = (column: string) => {
        if (column === 'nickname') return null;
        if (sortColumn !== column) return <span style={{ color: '#ccc' }}>↕</span>;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRelativeTime = (dateString: string | null) => {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            const remainingHours = diffHours % 24;
            return `${diffDays}일 ${remainingHours}시간 전`;
        }
        if (diffHours > 0) {
            const remainingMinutes = diffMinutes % 60;
            return `${diffHours}시간 ${remainingMinutes}분 전`;
        }
        if (diffMinutes > 0) return `${diffMinutes}분 전`;
        return '방금 전';
    };

    if (error) return <div>오류: {error.message}</div>;

    return (
        <div>
            <h3>사용자 관리</h3>
            <div style={{ marginBottom: '10px' }}>
                총 회원 수: {totalCount.toLocaleString()}명
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f9f9f9' }}>
                        <th onClick={() => handleSort('nickname')} style={{ padding: '10px', cursor: 'default', width: '15%' }}>닉네임</th>
                        <th onClick={() => handleSort('created_at')} style={{ padding: '10px', cursor: 'pointer', width: '20%' }}>
                            가입일 {renderSortArrow('created_at')}
                        </th>
                        <th onClick={() => handleSort('high_score')} style={{ padding: '10px', cursor: 'pointer', width: '15%' }}>
                            최고 점수 {renderSortArrow('high_score')}
                        </th>
                        <th onClick={() => handleSort('drop_point')} style={{ padding: '10px', cursor: 'pointer', width: '15%' }}>
                            보유 DR {renderSortArrow('drop_point')}
                        </th>
                        <th onClick={() => handleSort('total_games')} style={{ padding: '10px', cursor: 'pointer', width: '10%' }}>
                            게임 횟수 {renderSortArrow('total_games')}
                        </th>
                        <th onClick={() => handleSort('last_played_at')} style={{ padding: '10px', cursor: 'pointer', width: '25%' }}>
                            최근 게임 일자 {renderSortArrow('last_played_at')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</td></tr>
                    ) : users?.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>데이터가 없습니다.</td></tr>
                    ) : (
                        users?.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{user.nickname}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{formatDate(user.created_at)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{user.high_score.toLocaleString()}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{user.drop_point.toLocaleString()}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{user.total_games.toLocaleString()}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    {formatDate(user.last_played_at)}
                                    {user.last_played_at && (
                                        <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '5px' }}>
                                            ({getRelativeTime(user.last_played_at)})
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        style={{ padding: '5px 10px' }}
                    >
                        &laquo;
                    </button>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '5px 10px' }}
                    >
                        &lt;
                    </button>
                    <span style={{ padding: '5px 10px', lineHeight: '100%', display: 'flex', alignItems: 'center' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '5px 10px' }}
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        style={{ padding: '5px 10px' }}
                    >
                        &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
