/*
# Fix Gift Code Generation

## Problem
The generate_gift_code() function doesn't check for duplicates.
When a duplicate code is generated, the INSERT fails with 409 error.

## Solution
Update the function to check for existing codes and retry if duplicate.
*/

-- Update generate_gift_code to check for duplicates
CREATE OR REPLACE FUNCTION generate_gift_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing characters
  result text := '';
  i integer;
  code_length integer := 8; -- Default 8 characters
  max_attempts integer := 10; -- Maximum retry attempts
  attempt integer := 0;
BEGIN
  LOOP
    -- Generate random code
    result := '';
    FOR i IN 1..code_length LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM gift_codes WHERE code = result) THEN
      RETURN result;
    END IF;
    
    -- Increment attempt counter
    attempt := attempt + 1;
    
    -- If max attempts reached, raise error
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique gift code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION generate_gift_code IS 'Generate unique gift code with duplicate checking';
