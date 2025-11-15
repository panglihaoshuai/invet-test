import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client (for database only, not auth)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store verification code in database
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt,
        used: false
      });

    if (insertError) {
      console.error('Failed to store verification code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Check if this is the admin email that should receive real emails
    const isAdminEmail = email.toLowerCase() === '1062250152@qq.com';
    
    // For non-admin emails, always use development mode
    if (!isAdminEmail) {
      console.log(`Development mode: Email not sent to ${email}`);
      console.log(`Verification code for ${email}: ${code}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: '验证码已生成（开发模式）',
          devCode: code // Development mode - show code
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For admin email, try to send real email
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      console.log('Development mode: Verification code stored but email not sent');
      console.log(`Verification code for ${email}: ${code}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: '验证码已生成（邮件服务未配置）',
          devCode: code // Only for development
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Acme <onboarding@resend.dev>',
        to: email,
        subject: '您的登录验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>登录验证码</h2>
            <p>您的验证码是：</p>
            <h1 style="color: #1DB954; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p>此验证码将在 5 分钟后过期。</p>
            <p>如果您没有请求此验证码，请忽略此邮件。</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send email to admin:', errorText);
      
      // Even if email fails, return success with devCode for admin
      console.log(`Fallback to development mode for admin`);
      console.log(`Verification code for ${email}: ${code}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: '验证码已生成（邮件发送失败，请查看弹窗）',
          devCode: code // Fallback for admin
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: '验证码已发送到您的邮箱'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Exception in send-verification-code:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
