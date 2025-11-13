/*
# Refresh Schema Cache

## Problem
PostgREST schema cache doesn't include the public.users table, causing:
Error: "Could not find the table 'public.users' in the schema cache" (PGRST205)

## Solution
1. Ensure the table is properly exposed to the API
2. Grant all necessary permissions
3. Notify PostgREST to reload the schema cache

## Technical Details
PostgREST maintains a schema cache for performance. When tables are created,
the cache needs to be refreshed for the API to recognize them.
*/

-- Ensure the users table has all necessary grants
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Ensure the table is in the public schema and accessible
ALTER TABLE public.users OWNER TO postgres;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
