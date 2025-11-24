-- 관리자 기능을 위한 RLS 우회 설정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요.

-- 1. 단어 추가 함수 (add_words)
-- SECURITY DEFINER: 이 함수를 호출한 사용자의 권한이 아니라, 함수를 정의한 사람(관리자/postgres)의 권한으로 실행합니다.
ALTER FUNCTION add_words(jsonb) SECURITY DEFINER;

-- 2. 단어 레벨 수정 함수 (update_word_levels)
ALTER FUNCTION update_word_levels(bigint, int, int) SECURITY DEFINER;

-- 3. 단어 삭제 함수 (delete_word)
ALTER FUNCTION delete_word(bigint) SECURITY DEFINER;

-- 확인 메시지 (실행 결과에 표시됨)
SELECT 'Admin functions updated to use SECURITY DEFINER' as status;
