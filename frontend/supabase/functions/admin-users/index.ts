import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
    } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIST USERS
    if (req.method === "GET" || action === "list") {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, avatar_url, created_at");

      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role");

      const {
        data: { users: authUsers },
      } = await supabaseAdmin.auth.admin.listUsers();

      const combined = (profiles || []).map((p) => {
        const authUser = authUsers?.find((u) => u.id === p.user_id);
        const userRole = roles?.find((r) => r.user_id === p.user_id);
        return {
          id: p.user_id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          email: authUser?.email ?? "unknown",
          role: userRole?.role ?? "student",
          created_at: p.created_at,
          last_sign_in: authUser?.last_sign_in_at,
        };
      });

      return new Response(JSON.stringify(combined), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE USER
    if (req.method === "POST") {
      const { email, password, full_name, role } = await req.json();

      const {
        data: { user: newUser },
        error: createError,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      });

      if (createError) throw createError;

      return new Response(
        JSON.stringify({ success: true, user_id: newUser?.id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // UPDATE ROLE
    if (req.method === "PUT") {
      const { user_id, role } = await req.json();

      await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
