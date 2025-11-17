import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs";

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

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .upsert({ email: normalizedEmail, password_hash: hash }, { onConflict: 'email', ignoreDuplicates: false })
        .select()
        .maybeSingle();
      if (createError || !newUser) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      user = newUser;
    } else {
      const { error: updErr } = await supabase
        .from('users')
        .update({ password_hash: hash })
        .eq('id', user.id);
      if (updErr) {
        return new Response(JSON.stringify({ error: 'Failed to set password' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const role = normalizedEmail === '1062250152@qq.com' ? 'admin' : (profile?.role || 'user');

    if (!profile) {
      const { error: pErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: normalizedEmail, role });
      if (pErr) {
        return new Response(JSON.stringify({ error: 'Failed to create profile' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      const { error: pUpdErr } = await supabase
        .from('profiles')
        .update({ email: normalizedEmail, role })
        .eq('id', user.id);
      if (pUpdErr) {
        return new Response(JSON.stringify({ error: 'Failed to update profile' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server error', details: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
