#!/bin/bash

echo "🧪 测试 Edge Function..."
echo ""
echo "📧 测试邮箱: test@example.com"
echo "🔗 URL: https://ahgnspudsmrvsqcinxcj.supabase.co/functions/v1/send-verification-code"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZ25zcHVkc21ydnNxY2lueGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjY3OTksImV4cCI6MjA3ODM0Mjc5OX0.KZkaD_GdgMXe_e7Eo0i6yf23-YyADnne3Biq9iizuW0" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZ25zcHVkc21ydnNxY2lueGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjY3OTksImV4cCI6MjA3ODM0Mjc5OX0.KZkaD_GdgMXe_e7Eo0i6yf23-YyADnne3Biq9iizuW0" \
  -d '{"email":"test@example.com"}' \
  https://ahgnspudsmrvsqcinxcj.supabase.co/functions/v1/send-verification-code)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📊 HTTP 状态码: $HTTP_CODE"
echo "📦 响应内容:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 测试成功！Edge Function 正常工作"
  echo "📧 验证码已发送到 test@example.com"
  echo "💡 请检查邮箱（包括垃圾邮件文件夹）"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ 401 错误：认证失败"
  echo "💡 请检查 Authorization 头是否正确"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "⚠️  500 错误：服务器内部错误"
  echo "💡 可能是 RESEND_API_KEY 未配置或邮件发送失败"
else
  echo "❌ 测试失败：HTTP $HTTP_CODE"
fi

echo ""
echo "🔍 如需查看详细日志，请访问 Supabase 后台的 Edge Functions 日志"
