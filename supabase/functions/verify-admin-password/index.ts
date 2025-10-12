import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    // 이 함수는 이제 service_role 권한으로 실행되므로, Deno.env.get으로 Vault 값을 가져올 수 있습니다.
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!serviceRoleKey || !adminPassword) {
      throw new Error("Service role key or admin password not found in environment variables.");
    }

    if (password === adminPassword) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: "Invalid password" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
  } catch (error) {
    console.error("Error in verify-admin-password function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});