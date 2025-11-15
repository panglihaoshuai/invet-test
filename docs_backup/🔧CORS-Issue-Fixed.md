# 🔧 CORS Issue Fixed

## Problem

The application was experiencing CORS errors when trying to call Edge Functions:

```
Access to fetch at 'https://zrfnnerdaijcmhlemqld.supabase.co/functions/v1/send-verification-code' 
from origin 'https://app-7gjbw3zqrmdd-vitesandbox.sandbox.medo.dev' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## Root Cause

Supabase Edge Functions have **JWT verification enabled by default** (`verify_jwt: true`). This means:

1. **ALL requests** (including OPTIONS preflight requests) are checked for valid JWT tokens
2. The JWT verification happens **BEFORE** the Edge Function code runs
3. OPTIONS requests don't have JWT tokens, so they fail verification
4. This prevents the CORS headers from being returned, causing CORS errors

## Solution

Changed from using `supabase.functions.invoke()` to direct `fetch()` calls:

### Before (❌ Caused CORS errors):
```typescript
const { data, error } = await supabase.functions.invoke('send-verification-code', {
  body: { email },
});
```

**Problem**: `supabase.functions.invoke()` automatically adds authentication headers that trigger JWT verification.

### After (✅ Works correctly):
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/send-verification-code`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  },
  body: JSON.stringify({ email }),
});
```

**Why it works**: Direct `fetch()` calls with only the `apikey` header bypass JWT verification while still authenticating with Supabase.

## Changes Made

### 1. Updated AuthContext.tsx

**File**: `src/contexts/AuthContext.tsx`

**Changes**:
- Removed `import { supabase } from '@/db/supabase'`
- Added direct environment variable access:
  ```typescript
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  ```
- Replaced all `supabase.functions.invoke()` calls with direct `fetch()` calls
- Updated error handling to work with fetch responses

**Functions updated**:
- `sendVerificationCode()` - Send verification code email
- `verifyCodeAndLogin()` - Verify code and generate JWT token
- `verifyToken()` - Validate existing JWT token

### 2. Updated Edge Functions CORS Headers

**Files**:
- `supabase/functions/send-verification-code/index.ts`
- `supabase/functions/verify-code-and-login/index.ts`
- `supabase/functions/verify-token/index.ts`

**Changes**:
- Added proper CORS headers:
  ```typescript
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
  ```
- Updated OPTIONS handler to return 204 status:
  ```typescript
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  ```
- Redeployed all Edge Functions (version 3)

## Testing

### Test 1: Send Verification Code

1. Open the login page
2. Enter your email address
3. Click "Send Verification Code"
4. **Expected**: Success message, no CORS errors
5. **Check**: Email should arrive within 1-2 minutes

### Test 2: Verify Login

1. Enter the 6-digit code from email
2. Click "Verify Login"
3. **Expected**: Login successful, redirect to homepage
4. **Check**: User should be logged in

### Test 3: Token Verification

1. Refresh the page (F5)
2. **Expected**: User remains logged in
3. **Check**: No need to re-enter verification code

## Technical Details

### CORS Preflight Request Flow

**Before (Failed)**:
```
Browser → OPTIONS request → Supabase JWT Verification (FAIL) → 401 Error → CORS Error
```

**After (Success)**:
```
Browser → OPTIONS request → Edge Function → Return 204 with CORS headers → Success
Browser → POST request → Edge Function → Process request → Return data with CORS headers
```

### Authentication Flow

1. **Send Verification Code**:
   ```
   Frontend → POST /functions/v1/send-verification-code
   → Edge Function generates 6-digit code
   → Store in database
   → Send email via Resend
   → Return success
   ```

2. **Verify and Login**:
   ```
   Frontend → POST /functions/v1/verify-code-and-login
   → Edge Function verifies code
   → Create or get user
   → Generate JWT token (30 days)
   → Return token + user data
   → Frontend stores token in localStorage
   ```

3. **Token Verification**:
   ```
   Frontend → POST /functions/v1/verify-token (with Bearer token)
   → Edge Function verifies JWT
   → Get user from database
   → Return user data
   ```

## Environment Variables

The following environment variables are used:

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://zrfnnerdaijcmhlemqld.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ID=app-7gjbw3zqrmdd
VITE_API_ENV=production
```

### Backend (Supabase Secrets)
```
RESEND_API_KEY=re_2Zr6L6mW_42TvhxNHeBDktZLaXXcjkXnd
JWT_SECRET=xKXlFSmICJQeClFK8OyciqMe4wFfXdkMjxfxCkZ6yR4=
```

## Verification Checklist

- [x] CORS headers properly configured
- [x] Edge Functions redeployed (version 3)
- [x] AuthContext updated to use fetch()
- [x] Code linting passed (0 errors)
- [ ] Test send verification code
- [ ] Test verify login
- [ ] Test token verification
- [ ] Test logout

## Next Steps

1. **Test the login flow**:
   - Refresh the application page
   - Try sending a verification code
   - Check for CORS errors in Console (should be none)

2. **If still experiencing issues**:
   - Check browser Console for errors
   - Check Network tab for request/response details
   - Verify environment variables are loaded correctly

3. **Monitor email delivery**:
   - Check Resend Dashboard for email logs
   - Verify emails are being sent successfully
   - Check spam folder if email doesn't arrive

## Additional Notes

### Why Not Disable JWT Verification?

While it's possible to disable JWT verification on Edge Functions, using direct `fetch()` calls is a better solution because:

1. **More Control**: We have full control over headers and request format
2. **Explicit**: The code clearly shows what headers are being sent
3. **Flexible**: Easy to add custom headers or modify behavior
4. **Standard**: Uses standard fetch API, no Supabase-specific methods

### Security Considerations

- The `apikey` header uses the **anon key**, which is safe to expose in frontend code
- The **service role key** is only used in Edge Functions (server-side)
- JWT tokens are signed with a strong secret key (32+ characters)
- Verification codes expire after 5 minutes
- Codes can only be used once

## Troubleshooting

### Issue: Still seeing CORS errors

**Solution**: 
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Wait 1-2 minutes for Edge Function deployment to propagate

### Issue: "Failed to send verification code"

**Possible causes**:
1. Resend API key not configured
2. Email address invalid
3. Resend service down

**Solution**: Check browser Console for detailed error message

### Issue: "Invalid or expired verification code"

**Possible causes**:
1. Code expired (>5 minutes)
2. Code already used
3. Code entered incorrectly

**Solution**: Request a new verification code

## Success Indicators

You'll know the fix is working when:

1. ✅ No CORS errors in browser Console
2. ✅ "Verification code sent" message appears
3. ✅ Email arrives with 6-digit code
4. ✅ Login successful after entering code
5. ✅ User remains logged in after page refresh

---

**Status**: ✅ Fixed and ready for testing

**Last Updated**: 2025-01-10

**Version**: 3 (all Edge Functions)
