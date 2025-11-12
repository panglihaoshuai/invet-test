import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ok(data: any): Response {
  return new Response(
    JSON.stringify({ code: "SUCCESS", message: "成功", data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function fail(msg: string, code = 400): Response {
  return new Response(
    JSON.stringify({ code: "FAIL", message: msg }),
    {
      status: code,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function buildDeepSeekPrompt(testData: any): string {
  return `你是一位资深的投资心理学家和金融顾问，擅长基于Big Five人格模型、金融知识水平和风险偏好进行投资策略分析。

请基于以下测评数据，为用户提供专业、深入的投资心理分析和个性化建议。

## 测评数据

### 1. 人格特质分数（Big Five）
${testData.personality_scores ? `
- 开放性 (Openness): ${testData.personality_scores.openness}/100
- 尽责性 (Conscientiousness): ${testData.personality_scores.conscientiousness}/100
- 外向性 (Extraversion): ${testData.personality_scores.extraversion}/100
- 宜人性 (Agreeableness): ${testData.personality_scores.agreeableness}/100
- 神经质 (Neuroticism): ${testData.personality_scores.neuroticism}/100
` : '未完成人格测试'}

### 2. 数学与金融能力
${testData.math_finance_scores ? `
- 总分: ${testData.math_finance_scores.total_score}
- 正确率: ${testData.math_finance_scores.percentage}%
- 正确题数: ${testData.math_finance_scores.correct_answers}/${testData.math_finance_scores.total_questions}
` : '未完成数学金融测试'}

### 3. 风险偏好
${testData.risk_preference_scores ? `
- 风险容忍度: ${testData.risk_preference_scores.risk_tolerance}/10
- 投资期限: ${testData.risk_preference_scores.investment_horizon}
- 损失厌恶程度: ${testData.risk_preference_scores.loss_aversion}/10
` : '未完成风险偏好测试'}

### 4. 交易特征
${testData.trading_characteristics ? `
- 交易频率: ${testData.trading_characteristics.trading_frequency}
- 偏好标的: ${testData.trading_characteristics.preferred_instruments}
- 分析方法: ${testData.trading_characteristics.analysis_method}
- 技术分析偏好: ${testData.trading_characteristics.technical_preference}
- 决策依据: ${testData.trading_characteristics.decision_basis}
- 投资理念: ${testData.trading_characteristics.investment_philosophy}
- 学习方式: ${testData.trading_characteristics.learning_style}
- 组合管理: ${testData.trading_characteristics.portfolio_approach}
` : '未完成交易特征测试'}

### 5. 系统推荐的投资风格
- 投资风格: ${testData.investment_style || '未评估'}
- 欧几里得距离: ${testData.euclidean_distance || 'N/A'}

## 分析要求

请按照以下结构提供分析，总字数应在 1500-2500 字之间：

### 1. 投资人格画像（300-400字）
- 基于 Big Five 人格特质，深入分析用户的投资性格
- 解释各项特质如何影响投资决策和行为
- 指出性格优势和潜在风险点

### 2. 金融知识与能力评估（200-300字）
- 评估用户的金融数学知识水平
- 指出知识强项和需要提升的领域
- 提供具体的学习建议

### 3. 风险管理分析（300-400字）
- 深入分析用户的风险容忍度和损失厌恶特征
- 结合人格特质解释风险偏好的心理根源
- 提供个性化的风险管理策略

### 4. 投资策略建议（400-600字）
- 基于所有测评数据，提供详细的投资策略建议
- 包括资产配置、交易频率、持仓周期等
- 提供 3-5 个具体的可执行建议
- 解释为什么这些策略适合用户

### 5. 行为偏差预警（200-300字）
- 基于用户的人格和风险特征，指出可能存在的行为偏差
- 提供具体的预防和纠正方法
- 帮助用户认识并克服这些偏差

### 6. 长期发展路径（200-300字）
- 提供投资能力提升的长期规划
- 包括知识学习、实践经验、心态调整等方面
- 设定阶段性目标和里程碑

## 注意事项

1. **专业性**：使用专业的金融和心理学术语，但确保通俗易懂
2. **个性化**：所有分析必须紧密结合用户的具体数据，避免泛泛而谈
3. **实用性**：提供具体、可执行的建议，而非空洞的理论
4. **客观性**：既要指出优势，也要坦诚地提示风险和不足
5. **积极性**：保持积极、鼓励的语气，增强用户信心
6. **结构化**：使用清晰的标题和分段，便于阅读

请现在开始你的专业分析：`;
}

async function callDeepSeekAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY未配置");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一位资深的投资心理学家和金融顾问，擅长基于人格特质、金融知识和风险偏好进行投资策略分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API调用失败: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { testResultId, orderId } = await req.json();
    if (!testResultId || !orderId) {
      throw new Error("缺少必要参数");
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("未授权");
    }

    // 验证订单是否已支付
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("status", "completed")
      .single();

    if (orderError || !order) {
      throw new Error("订单不存在或未支付");
    }

    // 检查是否已有分析结果（避免重复生成）
    const { data: existingAnalysis } = await supabase
      .from("deepseek_analyses")
      .select("*")
      .eq("test_result_id", testResultId)
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingAnalysis) {
      return ok({
        analysis: existingAnalysis,
        cached: true
      });
    }

    // 获取测试结果
    const { data: testResult, error: testError } = await supabase
      .from("test_results")
      .select("*")
      .eq("id", testResultId)
      .single();

    if (testError || !testResult) {
      throw new Error("测试结果不存在");
    }

    // 构建提示词并调用DeepSeek API
    const prompt = buildDeepSeekPrompt(testResult);
    const analysisContent = await callDeepSeekAPI(prompt);

    // 保存分析结果
    const testDataSummary = {
      personality_scores: testResult.personality_scores,
      math_finance_scores: testResult.math_finance_scores,
      risk_preference_scores: testResult.risk_preference_scores,
      trading_characteristics: testResult.trading_characteristics,
      investment_style: testResult.investment_style,
      euclidean_distance: testResult.euclidean_distance,
    };

    const { data: analysis, error: insertError } = await supabase
      .from("deepseek_analyses")
      .insert({
        user_id: user.id,
        test_result_id: testResultId,
        order_id: orderId,
        analysis_content: analysisContent,
        prompt_used: prompt,
        test_data_summary: testDataSummary,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`保存分析结果失败: ${insertError.message}`);
    }

    return ok({
      analysis,
      cached: false
    });
  } catch (error) {
    console.error("生成DeepSeek分析失败:", error);
    return fail(error instanceof Error ? error.message : "生成分析失败", 500);
  }
});
