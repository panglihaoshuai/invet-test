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
    const provider = Deno.env.get('EMAIL_PROVIDER') || 'resend';

    if (provider === 'sendcloud') {
      const apiUser = Deno.env.get('SENDCLOUD_API_USER');
      const apiKey = Deno.env.get('SENDCLOUD_API_KEY');
      const fromEmail = Deno.env.get('SENDCLOUD_FROM') || 'no-reply@example.com';
      const fromName = Deno.env.get('SENDCLOUD_FROM_NAME') || 'Verification';

      if (!apiUser || !apiKey) {
        return new Response(
          JSON.stringify({ success: false, error: '邮件服务未配置' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const params = new URLSearchParams();
      params.append('apiUser', apiUser);
      params.append('apiKey', apiKey);
      params.append('from', fromEmail);
      params.append('fromName', fromName);
      params.append('to', email);
      params.append('subject', '您的登录验证码');
      params.append('html', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>登录验证码</h2>
          <p>您的验证码是：</p>
          <h1 style="color: #1DB954; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>此验证码将在 5 分钟后过期。</p>
          <p>如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
      `);

      const resp = await fetch('https://api.sendcloud.net/apiv2/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('SendCloud error:', text);
        return new Response(
          JSON.stringify({ success: false, error: '邮件发送失败' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (provider === 'tencent') {
      const secretId = Deno.env.get('TENCENT_SECRET_ID');
      const secretKey = Deno.env.get('TENCENT_SECRET_KEY');
      const region = Deno.env.get('TENCENT_REGION') || 'ap-hongkong';
      const fromEmail = Deno.env.get('TENCENT_FROM') || 'no-reply@example.com';

      if (!secretId || !secretKey) {
        return new Response(
          JSON.stringify({ success: false, error: '邮件服务未配置' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const endpoint = 'https://ses.tencentcloudapi.com';
      const action = 'SendEmail';
      const version = '2020-10-26';
      const service = 'ses';
      const timestamp = Math.floor(Date.now() / 1000);
      const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

      const body = {
        FromEmailAddress: fromEmail,
        Destination: [email],
        Subject: '您的登录验证码',
        Simple: {
          Html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>登录验证码</h2>
            <p>您的验证码是：</p>
            <h1 style="color: #1DB954; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p>此验证码将在 5 分钟后过期。</p>
            <p>如果您没有请求此验证码，请忽略此邮件。</p>
          </div>
          `
        }
      };

      async function sha256Hex(input: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const bytes = new Uint8Array(digest);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      async function hmacSha256Hex(key: ArrayBuffer | string, msg: string): Promise<string> {
        const encoder = new TextEncoder();
        const rawKey = typeof key === 'string' ? encoder.encode(key) : key;
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          rawKey,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(msg));
        const bytes = new Uint8Array(signature);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      async function hmacSha256(key: ArrayBuffer | string, msg: string): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const rawKey = typeof key === 'string' ? encoder.encode(key) : key;
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          rawKey,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(msg));
      }

      const canonicalHeaders =
        'content-type:application/json; charset=utf-8\n' +
        'host:ses.tencentcloudapi.com\n' +
        'x-tc-action:' + action.toLowerCase() + '\n';
      const signedHeaders = 'content-type;host;x-tc-action';
      const hashedRequestPayload = await sha256Hex(JSON.stringify(body));
      const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
      const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
      const credentialScope = `${date}/${service}/tc3_request`;
      const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

      const kDate = await hmacSha256('TC3' + secretKey, date);
      const kService = await hmacSha256(kDate, service);
      const kSigning = await hmacSha256(kService, 'tc3_request');
      const signature = await hmacSha256Hex(kSigning, stringToSign);
      const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json; charset=utf-8',
          'Host': 'ses.tencentcloudapi.com',
          'X-TC-Action': action,
          'X-TC-Version': version,
          'X-TC-Timestamp': String(timestamp),
          'X-TC-Region': region,
        },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Tencent SES error:', text);
        return new Response(
          JSON.stringify({ success: false, error: '邮件发送失败' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Acme <onboarding@resend.dev>';

      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: '邮件服务未配置' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
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
        console.error('Resend error:', errorText);
        return new Response(
          JSON.stringify({ success: false, error: '邮件发送失败' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
