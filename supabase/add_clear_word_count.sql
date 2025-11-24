-- stage_settings 테이블에 clear_word_count 컬럼 추가
-- 기본값은 20으로 설정 (기존 데이터에도 적용됨)

ALTER TABLE stage_settings 
ADD COLUMN clear_word_count INTEGER NOT NULL DEFAULT 20;

-- (선택 사항) 기존 clear_duration_seconds 컬럼은 나중에 삭제하거나 유지할 수 있습니다.
-- 현재는 호환성을 위해 유지합니다.

SELECT 'Added clear_word_count column to stage_settings' as status;
