/*
# Create Payment and DeepSeek Analysis Tables

## 1. New Tables

### `orders` Table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references auth.users, nullable for guest checkout)
- `items` (jsonb, stores order items details)
- `total_amount` (numeric(12,2), total payment amount in cents)
- `currency` (text, default 'cny')
- `status` (order_status enum: pending, completed, cancelled, refunded)
- `stripe_session_id` (text, unique, Stripe checkout session ID)
- `stripe_payment_intent_id` (text, Stripe payment intent ID)
- `customer_email` (text, customer email from Stripe)
- `customer_name` (text, customer name from Stripe)
- `test_result_id` (uuid, references test_results table)
- `completed_at` (timestamptz, payment completion timestamp)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `deepseek_analyses` Table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references auth.users)
- `test_result_id` (uuid, references test_results)
- `order_id` (uuid, references orders)
- `analysis_content` (text, DeepSeek AI generated analysis)
- `prompt_used` (text, the prompt template used)
- `test_data_summary` (jsonb, summary of test data sent to DeepSeek)
- `created_at` (timestamptz, default now())

## 2. Security

- Enable RLS on both tables
- Users can view their own orders and analyses
- Service role (Edge Functions) can manage all records
- Orders table is public for viewing (users can see their purchase history)
- DeepSeek analyses are private (only accessible to the user who purchased)

## 3. Indexes

- Index on user_id for faster user-specific queries
- Index on stripe_session_id for payment verification
- Index on test_result_id for linking analyses to test results
- Index on order status for filtering

## 4. Notes

- Payment amount is stored in cents (e.g., 399 for 3.99 RMB)
- Currency defaults to 'cny' (Chinese Yuan)
- Orders can be created without user_id (guest checkout)
- DeepSeek analyses are only created after successful payment
*/

-- Create order status enum
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  items jsonb NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'cny',
  status order_status NOT NULL DEFAULT 'pending'::order_status,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  test_result_id uuid REFERENCES test_results(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deepseek_analyses table
CREATE TABLE IF NOT EXISTS public.deepseek_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  test_result_id uuid REFERENCES test_results(id) NOT NULL,
  order_id uuid REFERENCES orders(id) NOT NULL,
  analysis_content text NOT NULL,
  prompt_used text NOT NULL,
  test_data_summary jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_test_result_id ON public.orders(test_result_id);

CREATE INDEX idx_deepseek_analyses_user_id ON public.deepseek_analyses(user_id);
CREATE INDEX idx_deepseek_analyses_test_result_id ON public.deepseek_analyses(test_result_id);
CREATE INDEX idx_deepseek_analyses_order_id ON public.deepseek_analyses(order_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepseek_analyses ENABLE ROW LEVEL SECURITY;

-- Orders policies: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Service role can manage all orders
CREATE POLICY "Service role can manage orders"
  ON public.orders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- DeepSeek analyses policies: Users can only view their own analyses
CREATE POLICY "Users can view own analyses"
  ON public.deepseek_analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all analyses
CREATE POLICY "Service role can manage analyses"
  ON public.deepseek_analyses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
