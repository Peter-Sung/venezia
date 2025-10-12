import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS 헤더 설정 (모든 출처에서의 요청을 허용)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Supabase 클라이언트를 service_role 키로 생성 (전체 권한)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 요청 본문에서 업데이트할 컬럼과 설정값들을 가져옵니다.
    const { column, settings } = await req.json();

    if (!column || !settings || typeof settings !== 'object') {
      throw new Error("Invalid column or settings data provided.");
    }

    // 전달받은 모든 설정값에 대해 업데이트 프로미스를 생성합니다.
    const updatePromises = Object.entries(settings).map(([stage_level, value]) =>
      supabaseAdmin
        .from("stage_settings")
        .update({ [column]: value }) // 동적으로 컬럼 설정
        .eq("stage_level", Number(stage_level))
    );

    // 모든 업데이트를 동시에 실행합니다.
    const results = await Promise.all(updatePromises);

    // 하나라도 에러가 있으면 전체를 실패 처리합니다.
    const firstError = results.find((res) => res.error);
    if (firstError) {
      throw firstError.error;
    }

    // 성공 응답을 반환합니다.
    return new Response(JSON.stringify({ message: "All settings updated successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // 실패 응답을 반환합니다.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
