// Re-deploying to fix bcrypt import issue
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from "npm:bcryptjs";

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nickname, password } = await req.json();

    if (!nickname || !password) {
      return new Response(JSON.stringify({ error: 'Nickname and password are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 닉네임 유효성 검사
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (koreanRegex.test(nickname)) {
      if (nickname.length < 2) {
        return new Response(JSON.stringify({ error: '한글 닉네임은 2자 이상이어야 합니다.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    } else {
      if (nickname.length < 4) {
        return new Response(JSON.stringify({ error: '영문/숫자 닉네임은 4자 이상이어야 합니다.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    // 서버 환경에서 Supabase 클라이언트 생성 (service_role 키 사용)
    const supabaseAdmin = createClient(
      Deno.env.get('VENEZIA_SUPABASE_URL') ?? '',
      Deno.env.get('VENEZIA_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 닉네임 중복 확인
    const { data: existingPlayer, error: selectError } = await supabaseAdmin
      .from('players')
      .select('nickname')
      .eq('nickname', nickname)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: 'Row not found'는 에러가 아님
      throw selectError;
    }

    if (existingPlayer) {
      return new Response(JSON.stringify({ error: 'Nickname already exists.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409, // Conflict
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 플레이어 정보 삽입
    const { error: insertError } = await supabaseAdmin
      .from('players')
      .insert({ nickname, hashed_password: hashedPassword });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ message: 'Player registered successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error('Error in register-player function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
