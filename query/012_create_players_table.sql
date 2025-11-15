-- 1. players 테이블 생성
-- id를 Supabase auth 사용자의 id (UUID)와 연결합니다.
CREATE TABLE public.players (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname text NOT NULL UNIQUE,
    cumulative_points integer NOT NULL DEFAULT 0,
    level text NOT NULL DEFAULT 'Bronze Medal',
    updated_at timestamptz DEFAULT now()
);

-- 2. Comment 추가
COMMENT ON TABLE public.players IS '게임 사용자 프로필 정보 및 누적 데이터를 저장합니다. auth.users 테이블을 확장합니다.';
COMMENT ON COLUMN public.players.id IS 'Supabase auth.users.id에 대한 외래 키입니다.';
COMMENT ON COLUMN public.players.nickname IS '사용자의 고유한 닉네임입니다.';
COMMENT ON COLUMN public.players.cumulative_points IS '사용자가 획득한 누적 포인트입니다.';
COMMENT ON COLUMN public.players.level IS '사용자의 누적 포인트에 따른 레벨 또는 등급입니다.';

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 4. 정책(Policies) 생성
-- 모든 사용자가 모든 플레이어의 프로필을 볼 수 있도록 허용 (랭킹 표시 등에 필요)
CREATE POLICY "Public profiles are viewable by everyone."
ON public.players FOR SELECT
USING (true);

-- 사용자가 자신의 프로필을 만들 수 있도록 허용
CREATE POLICY "Users can insert their own profile."
ON public.players FOR INSERT
WITH CHECK (auth.uid() = id);

-- 사용자가 자신의 프로필만 수정할 수 있도록 허용
CREATE POLICY "Users can update their own profile."
ON public.players FOR UPDATE
USING (auth.uid() = id);

-- 5. 새로운 사용자가 가입하면 자동으로 players 테이블에 프로필을 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.players (id, nickname)
  VALUES (new.id, new.raw_user_meta_data->>'nickname');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. auth.users 테이블에 새로운 사용자가 추가될 때마다 위 함수를 실행하는 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
