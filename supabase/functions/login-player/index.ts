import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

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

    // 서버 환경에서 Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('VENEZIA_SUPABASE_URL') ?? '',
      Deno.env.get('VENEZIA_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 닉네임으로 플레이어 조회
    const { data: player, error: selectError } = await supabaseAdmin
      .from('players')
      .select('id, nickname, hashed_password')
      .eq('nickname', nickname)
      .single();

    if (selectError || !player) {
      return new Response(JSON.stringify({ error: 'Nickname not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401, // Unauthorized
      });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, player.hashed_password);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Incorrect password.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401, // Unauthorized
      });
    }

    // JWT 생성을 위한 시크릿 키 가져오기
    const jwtSecret = Deno.env.get('VENEZIA_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in environment variables.');
    }
    
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );

    // JWT payload 설정
    const payload = {
      iss: 'venezia-game', // 발행자
      sub: player.id.toString(), // 주제 (사용자 ID)
      nickname: player.nickname,
      exp: getNumericDate(60 * 60 * 24 * 7), // 7일 후 만료
    };

    const jwt = await create({ alg: "HS256", typ: "JWT" }, payload, key);

    return new Response(JSON.stringify({ message: 'Login successful.', token: jwt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in login-player function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
