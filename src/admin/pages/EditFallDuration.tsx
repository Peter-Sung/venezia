import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllStageSettings } from '../../lib/queries';
import { supabase } from '../../lib/supabaseClient';

interface StageSetting {
  stage_level: number;
  fall_duration_seconds: number;
  spawn_interval_seconds: number;
  clear_duration_seconds: number;
}

const EditFallDuration: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery<StageSetting[], Error>({
    queryKey: ['allStageSettings'],
    queryFn: fetchAllStageSettings,
  });

  const [durations, setDurations] = useState<Record<number, number>>({});

  useEffect(() => {
    if (settings) {
      const initialDurations = settings.reduce((acc, setting) => {
        acc[setting.stage_level] = setting.fall_duration_seconds;
        return acc;
      }, {} as Record<number, number>);
      setDurations(initialDurations);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (allDurations: Record<number, number>) => {
      const { error } = await supabase.functions.invoke('update-stage-settings', {
        body: { column: 'fall_duration_seconds', settings: allDurations },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStageSettings'] });
      alert('모든 변경사항이 저장되었습니다.');
    },
    onError: (error) => {
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    }
  });

  const handleInputChange = (stage_level: number, value: string) => {
    setDurations(prev => ({ ...prev, [stage_level]: Number(value) }));
  };

  const handleSaveAll = () => {
    updateMutation.mutate(durations);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다: {error.message}</div>;

  return (
    <div>
      <h3>하강 시간 (fall_duration_seconds) 설정</h3>
      <p>각 단계별로 단어가 화면 상단에서 바닥까지 떨어지는 데 걸리는 시간을 초 단위로 설정합니다.</p>
      
      <div style={{ marginTop: '20px' }}>
        {settings?.map(setting => (
          <div key={setting.stage_level} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px' }}>{setting.stage_level}단계:</label>
            <input 
              type="number"
              step="0.1"
              value={durations[setting.stage_level] || ''}
              onChange={(e) => handleInputChange(setting.stage_level, e.target.value)}
              style={{ width: '100px' }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSaveAll} disabled={updateMutation.isPending} style={{ marginTop: '20px' }}>
        {updateMutation.isPending ? '저장 중...' : '전체 저장'}
      </button>
    </div>
  );
};

export default EditFallDuration;
