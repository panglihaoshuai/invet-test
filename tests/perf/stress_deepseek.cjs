const fs = require('fs')
const path = require('path')
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'))

async function call(language) {
  const res = await fetch(`${process.env.EDGE_BASE || cfg.EDGE_BASE}/generate_deepseek_analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AUTH_BEARER || cfg.AUTH_BEARER}` },
    body: JSON.stringify({
      testResultId: process.env.TEST_RESULT_ID || cfg.TEST_RESULT_ID,
      orderId: process.env.ORDER_ID || cfg.ORDER_ID,
      testData: (() => { try { return JSON.parse(process.env.TEST_DATA) } catch { return cfg.TEST_DATA } })(),
      language
    })
  })
  return res.status
}

async function run() {
  const tasks = []
  for (let i = 0; i < 50; i++) tasks.push(call(i % 2 === 0 ? 'zh' : 'en'))
  const start = Date.now()
  const results = await Promise.all(tasks)
  const duration = Date.now() - start
  const ok = results.filter(s => s === 200).length
  const fail = results.length - ok
  process.stdout.write(`deepseek count=${results.length} ok=${ok} fail=${fail} ms=${duration}\n`)
}

run()

