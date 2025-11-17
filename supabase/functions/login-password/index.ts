import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs";
import { create } from "jsr:@zaubrik/djwt@3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-jwt-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    const normalizedEmail = String(email || '').toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@') || typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (error || !user || !user.password_hash) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile) {
      const { data: adminEmail } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle();
      const role = adminEmail ? 'admin' : 'user';
      await supabase
        .from('profiles')
        .insert({ id: user.id, email: normalizedEmail, role });
      profile = { id: user.id, email: normalizedEmail, role } as any;
    }

    const jwtSecret = Deno.env.get('JWT_SECRET');
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    const payload = {
      sub: user.id,
      email: normalizedEmail,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    };
    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);

    const { data: adminEmail2 } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();
    const finalRole = adminEmail2 ? 'admin' : (profile?.role || 'user');
    return new Response(JSON.stringify({ success: true, token, user: { id: user.id, email: normalizedEmail, role: finalRole, created_at: user.created_at } }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server error', details: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
    const { data: blocked } = await supabase
      .from('blocked_emails')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (blocked) {
      return new Response(JSON.stringify({ error: 'Account blocked' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
