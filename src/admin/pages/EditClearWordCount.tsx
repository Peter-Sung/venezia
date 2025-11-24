import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllStageSettings } from '../../lib/queries';
import { supabase } from '../../lib/supabaseClient';

interface StageSetting {
    stage_level: number;
    fall_duration_seconds: number;
    spawn_interval_seconds: number;
    clear_duration_seconds: number;
    clear_word_count: number; // Added this column
}

const EditClearWordCount: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: settings, isLoading, error } = useQuery<StageSetting[], Error>({
        queryKey: ['allStageSettings'],
        queryFn: fetchAllStageSettings,
    });

    const [wordCounts, setWordCounts] = useState<Record<number, number | string>>({});

    useEffect(() => {
        if (settings) {
            const initialCounts = settings.reduce((acc, setting) => {
                // Fallback to 20 if clear_word_count is missing (e.g. before DB update propagates)
                acc[setting.stage_level] = setting.clear_word_count ?? 20;
                return acc;
            }, {} as Record<number, number | string>);
            setWordCounts(initialCounts);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: async (allCounts: Record<number, number>) => {
            const { error } = await supabase.functions.invoke('update-stage-settings', {
                body: { column: 'clear_word_count', settings: allCounts },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allStageSettings'] });
            alert('모든 변경사항이 저장되었습니다.');
        },
        onError: (error: any) => {
            alert(`저장 중 오류가 발생했습니다: ${error.message}`);
        }
    });

    const handleInputChange = (stage_level: number, value: string) => {
        const processedValue = value === '' ? '' : Number(value);
        if (isNaN(processedValue as number)) {
            return; // Prevent non-numeric input
        }
        setWordCounts(prev => ({ ...prev, [stage_level]: processedValue }));
    };

    const handleSaveAll = () => {
        const countsToSave: Record<number, number> = {};
        Object.keys(wordCounts).forEach(key => {
            const stageLevel = Number(key);
            const value = wordCounts[stageLevel];
            countsToSave[stageLevel] = value === '' ? 0 : Number(value);
        });
        updateMutation.mutate(countsToSave);
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류가 발생했습니다: {error.message}</div>;

    return (
        <div>
            <h3>단계별 클리어 단어 수 (clear_word_count) 설정</h3>
            <p>해당 단계를 클리어하기 위해 제거해야 하는 단어의 개수를 설정합니다.</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>* 노란색 단어, 바이러스로 제거된 단어, 지뢰로 제거된 단어는 카운트되지 않습니다.</p>

            <div style={{ marginTop: '20px' }}>
                {settings?.map(setting => (
                    <div key={setting.stage_level} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                        <label style={{ width: '80px' }}>{setting.stage_level}단계:</label>
                        <input
                            type="number"
                            step="1"
                            value={wordCounts[setting.stage_level] ?? ''}
                            onChange={(e) => handleInputChange(setting.stage_level, e.target.value)}
                            style={{ width: '100px' }}
                        />
                        <span style={{ marginLeft: '10px' }}>개</span>
                    </div>
                ))}
            </div>

            <button onClick={handleSaveAll} disabled={updateMutation.isPending} style={{ marginTop: '20px' }}>
                {updateMutation.isPending ? '저장 중...' : '전체 저장'}
            </button>
        </div>
    );
};

export default EditClearWordCount;
