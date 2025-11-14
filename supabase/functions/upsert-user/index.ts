import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the email from the request body
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: '缺少邮箱参数' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Supabase URL and construct the REST API URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use direct SQL execution via Supabase REST API
    // This bypasses the schema cache by using raw SQL
    const sqlQuery = `
      INSERT INTO public.users (email)
      VALUES ('${email.replace(/'/g, "''")}')
      ON CONFLICT (email) 
      DO UPDATE SET updated_at = now()
      RETURNING id, email, created_at, updated_at
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sqlQuery })
    });

    // If exec_sql doesn't exist, try a different approach
    if (!response.ok) {
      console.log('exec_sql failed, trying alternative approach');
      
      // Alternative: Try to use the users table directly with service role
      // Even if it's cached, service role might have better access
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify({ email })
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Insert failed:', errorText);
        
        // Try to get existing user
        const getResponse = await fetch(
          `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
          {
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
            }
          }
        );

        if (getResponse.ok) {
          const users = await getResponse.json();
          if (users && users.length > 0) {
            return new Response(
              JSON.stringify({ data: users[0] }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
        }

        return new Response(
          JSON.stringify({ 
            error: '创建用户失败', 
            details: errorText,
            hint: '表可能不在缓存中，请等待几分钟后重试'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const user = await insertResponse.json();
      return new Response(
        JSON.stringify({ data: Array.isArray(user) ? user[0] : user }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return new Response(
        JSON.stringify({ error: '创建用户失败：数据库未返回结果' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const user = Array.isArray(result) ? result[0] : result;

    return new Response(
      JSON.stringify({ data: user }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Exception in upsert-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器错误', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
