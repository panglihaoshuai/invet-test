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
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

function fail(msg: string, code = 400): Response {
  return new Response(
    JSON.stringify({ code: "FAIL", message: msg }),
    { status: code, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

function buildDeepSeekPrompt(testData: any, language: 'zh' | 'en' = 'zh'): string {
  if (language === 'en') {
    return `You are a seasoned investment psychologist and financial advisor, skilled at analyzing investment strategies based on Big Five personality traits, financial knowledge and risk preferences.

Please provide a professional, in-depth investment psychology analysis and personalized recommendations based on the following assessment data. Your analysis must be highly personalized and specific to the user's actual data, avoiding generic content.

## Assessment Data

### 1. Big Five Personality Scores
${testData.personality_scores ? `
- Openness: ${testData.personality_scores.openness}/100 (High: >70, Medium: 40-70, Low: <40)
- Conscientiousness: ${testData.personality_scores.conscientiousness}/100 (High: >70, Medium: 40-70, Low: <40)
- Extraversion: ${testData.personality_scores.extraversion}/100 (High: >70, Medium: 40-70, Low: <40)
- Agreeableness: ${testData.personality_scores.agreeableness}/100 (High: >70, Medium: 40-70, Low: <40)
- Neuroticism: ${testData.personality_scores.neuroticism}/100 (High: >70, Medium: 40-70, Low: <40)

**Personality Analysis Required**: Based on these specific scores, analyze:
- Which traits are dominant and how they interact
- How each specific score level affects investment behavior
- Unique personality combinations and their investment implications
` : 'Personality test not completed'}

### 2. Math & Finance Ability
${testData.math_finance_scores ? `
- Total Score: ${testData.math_finance_scores.total_score}
- Accuracy: ${testData.math_finance_scores.percentage}%
- Correct Answers: ${testData.math_finance_scores.correct_answers}/${testData.math_finance_scores.total_questions}

**Ability Analysis Required**: Based on these specific scores:
- Assess the user's actual financial knowledge level (beginner/intermediate/advanced)
- Identify specific knowledge gaps based on wrong answers
- Provide targeted learning recommendations
` : 'Math & finance test not completed'}

### 3. Risk Preference
${testData.risk_preference_scores ? `
- Risk Tolerance: ${testData.risk_preference_scores.risk_tolerance}/10 (1=Very Conservative, 10=Very Aggressive)
- Investment Horizon: ${testData.risk_preference_scores.investment_horizon}
- Loss Aversion: ${testData.risk_preference_scores.loss_aversion}/10 (1=Low, 10=High)

**Risk Analysis Required**: Based on these specific values:
- Explain the psychological meaning of these specific scores
- Analyze how risk tolerance interacts with loss aversion
- Identify potential conflicts between stated preferences and actual behavior
` : 'Risk preference test not completed'}

### 4. Trading Characteristics
${testData.trading_characteristics ? `
- Trading Frequency: ${testData.trading_characteristics.trading_frequency}
- Preferred Instruments: ${testData.trading_characteristics.preferred_instruments}
- Analysis Method: ${testData.trading_characteristics.analysis_method}
- Technical Preference: ${testData.trading_characteristics.technical_preference}
- Decision Basis: ${testData.trading_characteristics.decision_basis}
- Investment Philosophy: ${testData.trading_characteristics.investment_philosophy}
- Learning Style: ${testData.trading_characteristics.learning_style}
- Portfolio Approach: ${testData.trading_characteristics.portfolio_approach}

**Trading Style Analysis Required**: Based on these specific choices:
- Analyze the consistency and potential conflicts in trading style
- Identify how personality traits influence these choices
- Provide specific recommendations based on the user's actual preferences
` : 'Trading characteristics test not completed'}

### 5. System Recommended Investment Style
- Investment Style: ${testData.investment_style || 'Not evaluated'}
- Euclidean Distance: ${testData.euclidean_distance || 'N/A'}

**Style Matching Analysis Required**: 
- Explain why this style was recommended based on the user's data
- Analyze the match quality (distance score)
- Suggest adjustments if needed

## Analysis Requirements

Provide analysis in the following structure, with a total length of 1500-2500 words. **CRITICAL**: All analysis must reference specific scores and data points from above, not generic statements.

### 1. Investment Personality Profile (300-400 words)
- Analyze the user's investment personality based on their SPECIFIC Big Five scores
- Explain how each specific score level (high/medium/low) influences investment decisions
- Provide concrete examples of how their personality traits manifest in investment behavior
- Highlight unique strengths and specific risk points based on their score profile

### 2. Financial Knowledge & Ability (200-300 words)
- Assess the user's actual level based on their SPECIFIC test scores
- Identify specific knowledge gaps based on their accuracy percentage
- Provide targeted learning recommendations based on their actual performance
- Suggest specific resources or topics to study

### 3. Risk Management Analysis (300-400 words)
- Analyze the user's risk profile based on their SPECIFIC risk tolerance and loss aversion scores
- Explain the psychological roots of their risk preference based on their personality scores
- Identify potential conflicts (e.g., high risk tolerance but high loss aversion)
- Provide personalized risk management strategies based on their specific scores

### 4. Investment Strategy Recommendations (400-600 words)
- Provide detailed investment strategy suggestions based on ALL the user's specific data
- Include specific asset allocation percentages based on their risk profile
- Recommend specific trading frequency based on their personality and preferences
- Provide 3-5 specific, actionable suggestions tailored to their data
- Explain WHY each strategy fits their specific profile

### 5. Behavioral Bias Warning (200-300 words)
- Identify potential behavioral biases based on their SPECIFIC personality and risk scores
- Provide specific prevention methods tailored to their personality type
- Help them recognize and overcome biases relevant to their profile

### 6. Long-term Development Path (200-300 words)
- Provide a personalized long-term plan based on their current scores
- Include specific knowledge areas to improve based on their test performance
- Set phased goals based on their current ability level

## Critical Notes

1. **Personalization is MANDATORY**: Every section must reference specific scores and data from the user's assessment. Avoid generic statements.
2. **Use Actual Numbers**: Reference the exact scores (e.g., "Your Openness score of 75 indicates...")
3. **Explain Interactions**: Show how different traits/scores interact in this specific user
4. **Provide Specific Examples**: Give concrete examples relevant to their specific profile
5. **Avoid Generic Advice**: All recommendations must be tailored to their specific data

Begin your highly personalized analysis now:`;
  }
  
  return `你是一位资深的投资心理学家和金融顾问，擅长基于Big Five人格模型、金融知识水平和风险偏好进行投资策略分析。

请基于以下测评数据，为用户提供专业、深入的投资心理分析和个性化建议。**重要**：所有分析必须紧密结合用户的具体数据，避免泛泛而谈。

## 测评数据

### 1. 人格特质分数（Big Five）
${testData.personality_scores ? `
- 开放性 (Openness): ${testData.personality_scores.openness}/100 (高: >70, 中: 40-70, 低: <40)
- 尽责性 (Conscientiousness): ${testData.personality_scores.conscientiousness}/100 (高: >70, 中: 40-70, 低: <40)
- 外向性 (Extraversion): ${testData.personality_scores.extraversion}/100 (高: >70, 中: 40-70, 低: <40)
- 宜人性 (Agreeableness): ${testData.personality_scores.agreeableness}/100 (高: >70, 中: 40-70, 低: <40)
- 神经质 (Neuroticism): ${testData.personality_scores.neuroticism}/100 (高: >70, 中: 40-70, 低: <40)

**人格分析要求**：基于这些具体分数，分析：
- 哪些特质占主导地位，它们如何相互作用
- 每个具体分数水平如何影响投资行为
- 独特的人格组合及其投资含义
` : '未完成人格测试'}

### 2. 数学与金融能力
${testData.math_finance_scores ? `
- 总分: ${testData.math_finance_scores.total_score}
- 正确率: ${testData.math_finance_scores.percentage}%
- 正确题数: ${testData.math_finance_scores.correct_answers}/${testData.math_finance_scores.total_questions}

**能力分析要求**：基于这些具体分数：
- 评估用户的实际金融知识水平（初级/中级/高级）
- 根据错误答案识别具体的知识盲点
- 提供针对性的学习建议
` : '未完成数学金融测试'}

### 3. 风险偏好
${testData.risk_preference_scores ? `
- 风险容忍度: ${testData.risk_preference_scores.risk_tolerance}/10 (1=非常保守, 10=非常激进)
- 投资期限: ${testData.risk_preference_scores.investment_horizon}
- 损失厌恶程度: ${testData.risk_preference_scores.loss_aversion}/10 (1=低, 10=高)

**风险分析要求**：基于这些具体数值：
- 解释这些具体分数的心理含义
- 分析风险容忍度与损失厌恶如何相互作用
- 识别陈述偏好与实际行为之间的潜在冲突
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

**交易风格分析要求**：基于这些具体选择：
- 分析交易风格的一致性和潜在冲突
- 识别人格特质如何影响这些选择
- 基于用户的实际偏好提供具体建议
` : '未完成交易特征测试'}

### 5. 系统推荐的投资风格
- 投资风格: ${testData.investment_style || '未评估'}
- 欧几里得距离: ${testData.euclidean_distance || 'N/A'}

**风格匹配分析要求**：
- 解释为什么基于用户数据推荐这种风格
- 分析匹配质量（距离分数）
- 如需要，建议调整

## 分析要求

请按照以下结构提供分析，总字数应在 1500-2500 字之间。**关键**：所有分析必须引用上述的具体分数和数据点，而非泛泛而谈。

### 1. 投资人格画像（300-400字）
- 基于用户的**具体**Big Five分数，深入分析投资性格
- 解释每个具体分数水平（高/中/低）如何影响投资决策
- 提供具体例子说明他们的人格特质如何在投资行为中体现
- 基于他们的分数档案指出独特的优势和具体的风险点

### 2. 金融知识与能力评估（200-300字）
- 基于用户的**具体**测试分数评估实际水平
- 根据正确率百分比识别具体的知识盲点
- 基于实际表现提供针对性的学习建议
- 建议具体的学习资源或主题

### 3. 风险管理分析（300-400字）
- 基于用户的**具体**风险容忍度和损失厌恶分数分析风险档案
- 结合人格分数解释风险偏好的心理根源
- 识别潜在冲突（如高风险容忍度但高损失厌恶）
- 基于具体分数提供个性化的风险管理策略

### 4. 投资策略建议（400-600字）
- 基于用户**所有**具体数据提供详细的投资策略建议
- 根据风险档案包括具体的资产配置百分比
- 基于人格和偏好推荐具体的交易频率
- 提供3-5个针对其数据的具体、可执行建议
- 解释**为什么**每个策略适合他们的具体档案

### 5. 行为偏差预警（200-300字）
- 基于用户的**具体**人格和风险分数识别潜在的行为偏差
- 提供针对其人格类型的具体预防方法
- 帮助他们识别并克服与其档案相关的偏差

### 6. 长期发展路径（200-300字）
- 基于当前分数提供个性化的长期规划
- 根据测试表现包括需要改进的具体知识领域
- 基于当前能力水平设定阶段性目标

## 关键注意事项

1. **个性化是必须的**：每个部分都必须引用用户评估中的具体分数和数据。避免泛泛而谈。
2. **使用实际数字**：引用确切的分数（例如："您的开放性分数为75，表明..."）
3. **解释相互作用**：展示不同特质/分数如何在这个特定用户中相互作用
4. **提供具体例子**：给出与其具体档案相关的具体例子
5. **避免通用建议**：所有建议必须针对其具体数据定制

请现在开始你的高度个性化分析：`;
}

async function callDeepSeekAPI(prompt: string, language: 'zh' | 'en' = 'zh'): Promise<string> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY未配置");
  
  // 使用推理模型以获得更深入的分析（可选：deepseek-reasoner 或 deepseek-chat）
  // deepseek-reasoner 提供更强的推理能力，但响应时间可能更长
  const useReasoner = Deno.env.get("USE_DEEPSEEK_REASONER") === "true";
  const model = useReasoner ? "deepseek-reasoner" : "deepseek-chat";
  
  const requestBody = {
    model: model,
    messages: [
      { 
        role: "system", 
        content: language === 'zh' 
          ? "你是一位资深的投资心理学家和金融顾问，擅长基于人格特质、金融知识和风险偏好进行投资策略分析。请提供深入、个性化、基于具体数据的分析，避免泛泛而谈。" 
          : "You are a seasoned investment psychologist and financial advisor, skilled at analyzing investment strategies based on personality traits, financial knowledge and risk preferences. Provide in-depth, personalized, data-specific analysis, avoiding generic content." 
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  };
  
  console.log(`📤 [callDeepSeekAPI] 发送请求到 DeepSeek API...`, {
    model: requestBody.model,
    messagesCount: requestBody.messages.length,
    promptLength: prompt.length,
    hasApiKey: !!apiKey
  });
  
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${apiKey}` 
    },
    body: JSON.stringify(requestBody)
  });
  
  // 检查响应状态
  if (!response.ok) {
    let errorMessage = `DeepSeek API调用失败: HTTP ${response.status}`;
    try {
      // 尝试读取响应体作为文本
      const errorText = await response.text();
      if (errorText) {
        // 尝试解析为 JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = `DeepSeek API调用失败: ${errorJson.error?.message || errorJson.message || errorText}`;
        } catch {
          // 如果不是 JSON，直接使用文本
          errorMessage = `DeepSeek API调用失败: ${errorText}`;
        }
      }
    } catch (readError) {
      console.error(`❌ [callDeepSeekAPI] 读取错误响应失败:`, readError);
      errorMessage = `DeepSeek API调用失败: HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  // 解析成功响应
  let data: any;
  try {
    const responseText = await response.text();
    console.log(`📥 [callDeepSeekAPI] 收到响应:`, {
      status: response.status,
      contentType: response.headers.get('Content-Type'),
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 200)
    });
    
    // 确保响应是有效的 JSON
    if (!responseText || responseText.trim() === '') {
      throw new Error('DeepSeek API 返回空响应');
    }
    
    data = JSON.parse(responseText);
  } catch (parseError) {
    const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
    console.error(`❌ [callDeepSeekAPI] 解析响应失败:`, {
      error: errorMsg,
      errorStack: parseError instanceof Error ? parseError.stack : undefined,
      contentType: response.headers.get('Content-Type'),
      status: response.status
    });
    throw new Error(`DeepSeek API 响应解析失败: ${errorMsg}`);
  }
  
  // 检查响应数据结构
  if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    console.error(`❌ [callDeepSeekAPI] 响应数据格式错误:`, {
      hasData: !!data,
      hasChoices: !!data?.choices,
      choicesLength: data?.choices?.length || 0,
      responseKeys: data ? Object.keys(data).slice(0, 10) : []
    });
    throw new Error('DeepSeek API 返回数据格式错误: 缺少 choices 字段');
  }
  
  const content = data.choices[0]?.message?.content;
  if (!content) {
    console.error(`❌ [callDeepSeekAPI] 响应中缺少内容:`, {
      choice: data.choices[0],
      hasMessage: !!data.choices[0]?.message,
      messageKeys: data.choices[0]?.message ? Object.keys(data.choices[0].message) : []
    });
    throw new Error('DeepSeek API 返回数据格式错误: 缺少 content 字段');
  }
  
  console.log(`✅ [callDeepSeekAPI] 成功获取分析内容:`, {
    contentLength: content.length,
    contentPreview: content.substring(0, 100)
  });
  
  return content;
}

Deno.serve(async (req) => {
  const errorCode = 'FREE_ANALYSIS_ERROR';
  let consumedAnalysis = false; // 标记是否已扣除次数，用于失败时回滚
  
  try {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return fail("Method not allowed", 405);

    // 解析请求体
    let requestBody: any;
    try {
      // 检查 Content-Type
      const contentType = req.headers.get('Content-Type') || '';
      console.log(`📥 [${errorCode}] 收到请求:`, {
        method: req.method,
        contentType,
        hasBody: !!req.body
      });

      // 读取原始文本，然后手动解析 JSON
      // 这样可以更好地控制错误处理，并且可以看到原始内容
      // 注意：Request body 只能读取一次，所以先读取文本，然后手动解析
      const bodyText = await req.text();
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('请求体为空');
      }

      // 检查是否是 "[object Object]" 字符串（说明对象被错误地转换为字符串）
      if (bodyText === '[object Object]' || bodyText.trim() === '[object Object]') {
        console.error(`❌ [${errorCode}_PARSE] 检测到 "[object Object]" 字符串，说明请求体序列化失败`);
        throw new Error('请求体序列化失败：对象被错误地转换为字符串 "[object Object]"。请确保客户端正确序列化 JSON。');
      }

      // 手动解析 JSON
      try {
        requestBody = JSON.parse(bodyText);
        console.log(`✅ [${errorCode}] 请求体 JSON 解析成功`);
      } catch (jsonParseError) {
        console.error(`❌ [${errorCode}_PARSE] JSON 解析失败:`, {
          error: jsonParseError instanceof Error ? jsonParseError.message : String(jsonParseError),
          bodyPreview: bodyText.substring(0, 200),
          bodyLength: bodyText.length,
          bodyType: typeof bodyText
        });
        throw new Error(`JSON 解析失败: ${jsonParseError instanceof Error ? jsonParseError.message : String(jsonParseError)}`);
      }
      
      console.log(`✅ [${errorCode}] 请求体解析成功:`, {
        hasTestResultId: !!requestBody?.testResultId,
        hasTestData: !!requestBody?.testData,
        language: requestBody?.language || 'zh',
        testResultId: requestBody?.testResultId,
        testDataType: typeof requestBody?.testData,
        testDataKeys: requestBody?.testData && typeof requestBody.testData === 'object' 
          ? Object.keys(requestBody.testData).slice(0, 10) 
          : []
      });
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error(`❌ [${errorCode}_PARSE] 解析请求体失败:`, {
        error: errorMsg,
        errorStack: parseError instanceof Error ? parseError.stack : undefined,
        contentType: req.headers.get('Content-Type'),
        method: req.method,
        errorName: parseError instanceof Error ? parseError.name : undefined
      });
      
      return fail(`请求体格式错误: ${errorMsg}`, 400);
    }

    const { testResultId, testData, language } = requestBody || {};
    if (!testResultId || !testData) {
      console.error(`❌ [${errorCode}_001] 缺少必要参数`);
      return fail("缺少必要参数: testResultId 或 testData", 400);
    }

    // 1. 验证用户身份
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    console.log(`🔐 [${errorCode}] 开始认证流程...`, {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) + '...',
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token ? token.substring(0, 30) + '...' : 'N/A'
    });
    
    if (!token) {
      console.error(`❌ [${errorCode}_002] 未提供认证token`, {
        authHeader: authHeader || 'null',
        allHeaders: Object.fromEntries(req.headers.entries())
      });
      return fail("未授权: 缺少认证token", 401);
    }

    console.log(`🔐 [${errorCode}] 调用 supabase.auth.getUser()...`);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error(`❌ [${errorCode}_003] 认证失败:`, {
        errorName: authError.name,
        errorMessage: authError.message,
        errorStatus: authError.status,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 30) + '...',
        tokenSuffix: '...' + token.substring(token.length - 10),
        fullError: JSON.stringify(authError, null, 2)
      });
      return fail(`认证失败: ${authError.message || 'Token无效或已过期，请重新登录'}`, 401);
    }
    
    if (!user) {
      console.error(`❌ [${errorCode}_004] 用户不存在`, {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 30) + '...'
      });
      return fail("未授权: 用户不存在", 401);
    }

    console.log(`✅ [${errorCode}] 用户认证成功:`, { 
      userId: user.id, 
      email: user.email,
      emailConfirmed: user.email_confirmed_at ? 'yes' : 'no',
      lastSignIn: user.last_sign_in_at || 'N/A'
    });

    // 2. 查询免费次数
    console.log(`🔍 [${errorCode}] 查询免费次数...`);
    const { data: freeCount, error: freeErr } = await supabase.rpc('get_user_free_analyses', { p_user_id: user.id });
    
    if (freeErr) {
      console.error(`❌ [${errorCode}_005] 查询免费次数失败:`, freeErr);
      return fail(`查询免费次数失败: ${freeErr.message}`, 500);
    }
    
    if (!freeCount || freeCount <= 0) {
      console.error(`❌ [${errorCode}_006] 无可用免费次数:`, { freeCount });
      return fail("无可用免费次数", 400);
    }

    console.log(`✅ [${errorCode}] 用户剩余免费次数:`, freeCount);

    // 3. 先调用 DeepSeek API 生成分析（不先扣除次数）
    console.log(`🤖 [${errorCode}] 开始调用 DeepSeek API...`);
    const prompt = buildDeepSeekPrompt(testData, language ?? 'zh');
    let analysisContent: string;
    
    try {
      analysisContent = await callDeepSeekAPI(prompt, language ?? 'zh');
      console.log(`✅ [${errorCode}] DeepSeek API 调用成功`);
    } catch (apiError) {
      console.error(`❌ [${errorCode}_007] DeepSeek API 调用失败:`, apiError);
      // 分析生成失败，不扣除次数，直接返回错误
      return fail(`DeepSeek API 调用失败: ${apiError instanceof Error ? apiError.message : String(apiError)}`, 500);
    }

    // 4. 分析生成成功，现在扣除次数
    console.log(`💳 [${errorCode}] 扣除免费次数...`);
    const { data: consumeOk, error: consumeErr } = await supabase.rpc('consume_free_analysis', { p_user_id: user.id });
    
    if (consumeErr || !consumeOk) {
      console.error(`❌ [${errorCode}_008] 扣减免费次数失败:`, { consumeErr, consumeOk });
      // 分析已生成但扣除失败，返回错误（分析内容已生成但未保存）
      return fail(`扣减免费次数失败: ${consumeErr?.message || '未知错误'}`, 500);
    }
    
    consumedAnalysis = true; // 标记已扣除
    console.log(`✅ [${errorCode}] 免费次数扣除成功`);

    // 5. 创建订单
    console.log(`📝 [${errorCode}] 创建订单...`);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items: [{ name: 'DeepSeek Free Analysis', price: 0, quantity: 1 }],
        total_amount: 0,
        currency: 'cny',
        status: 'completed',
        test_result_id: testResultId
        // 注意：orders 表没有 metadata 字段，已移除
      })
      .select()
      .single();
    
    if (orderError || !order) {
      console.error(`❌ [${errorCode}_009] 创建免费订单失败:`, orderError);
      // 订单创建失败，但次数已扣除，需要回滚
      await rollbackConsumedAnalysis(user.id);
      return fail(`创建免费订单失败: ${orderError?.message || '未知错误'}`, 500);
    }
    
    console.log(`✅ [${errorCode}] 订单创建成功:`, order.id);

    // 6. 保存分析结果
    console.log(`💾 [${errorCode}] 保存分析结果...`);
    const testDataSummary = {
      personality_scores: testData.personality_scores,
      math_finance_scores: testData.math_finance_scores,
      risk_preference_scores: testData.risk_preference_scores,
      trading_characteristics: testData.trading_characteristics,
      investment_style: testData.investment_style,
      euclidean_distance: testData.euclidean_distance,
    };

    const { data: analysis, error: insertError } = await supabase
      .from('deepseek_analyses')
      .insert({
        user_id: user.id,
        test_result_id: testResultId,
        order_id: order.id,
        analysis_content: analysisContent,
        prompt_used: prompt,
        test_data_summary: testDataSummary,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`❌ [${errorCode}_010] 保存分析结果失败:`, insertError);
      // 保存失败，但次数已扣除，需要回滚
      await rollbackConsumedAnalysis(user.id);
      return fail(`保存分析结果失败: ${insertError.message}`, 500);
    }

    console.log(`✅ [${errorCode}] 分析生成完成:`, analysis.id);
    return ok({ analysis });
  } catch (error) {
    // 安全地序列化错误信息
    let errorMessage = "生成分析失败";
    let errorDetails: any = {};
    
    try {
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // 尝试从对象中提取错误信息
        errorMessage = (error as any).message || (error as any).error || JSON.stringify(error);
        errorDetails = error;
      } else {
        errorMessage = String(error);
      }
    } catch (serializeError) {
      console.error(`❌ [${errorCode}_011_SERIALIZE] 序列化错误信息失败:`, serializeError);
      errorMessage = "生成分析失败: 未知错误";
    }
    
    console.error(`❌ [${errorCode}_011] 生成免费DeepSeek分析异常:`, {
      errorMessage,
      errorDetails: JSON.stringify(errorDetails, null, 2),
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
    
    // 如果已扣除次数，尝试回滚
    if (consumedAnalysis) {
      try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (token) {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            await rollbackConsumedAnalysis(user.id);
          }
        }
      } catch (rollbackError) {
        console.error(`❌ [${errorCode}_012] 回滚失败:`, {
          error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
        });
      }
    }
    
    return fail(errorMessage, 500);
  }
});

// 回滚已扣除的免费次数（补偿用户）
async function rollbackConsumedAnalysis(userId: string): Promise<void> {
  try {
    console.log(`🔄 [rollbackConsumedAnalysis] 尝试回滚用户免费次数:`, userId);
    
    // 找到最近扣除的一次，恢复它
    const { data: redemptions, error: fetchError } = await supabase
      .from('gift_code_redemptions')
      .select('*')
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false })
      .limit(1);
    
    if (fetchError || !redemptions || redemptions.length === 0) {
      console.error(`❌ [rollbackConsumedAnalysis] 查询兑换记录失败:`, fetchError);
      return;
    }
    
    const redemption = redemptions[0];
    
    // 增加一次剩余次数
    const { error: updateError } = await supabase
      .from('gift_code_redemptions')
      .update({ remaining_analyses: redemption.remaining_analyses + 1 })
      .eq('id', redemption.id);
    
    if (updateError) {
      console.error(`❌ [rollbackConsumedAnalysis] 回滚失败:`, updateError);
    } else {
      console.log(`✅ [rollbackConsumedAnalysis] 回滚成功，已恢复一次免费次数`);
    }
  } catch (error) {
    console.error(`❌ [rollbackConsumedAnalysis] 回滚异常:`, error);
  }
}

