const fs = require('fs')
const path = require('path')
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'))
const payloads = JSON.parse(fs.readFileSync(path.join(__dirname, 'sql_payloads.json'), 'utf-8'))

const base = process.env.EDGE_BASE || cfg.EDGE_BASE

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { status: res.status }
}

async function run() {
  const targets = [
    { url: `${base}/login-password`, fields: ['email', 'password'] },
    { url: `${base}/register-password`, fields: ['email', 'password'] },
    { url: `${base}/verify-code-and-login`, fields: ['email', 'code'] },
    { url: `${base}/send-verification-code`, fields: ['email'] }
  ]

  for (const t of targets) {
    for (const p of payloads) {
      const body = {}
      for (const f of t.fields) body[f] = p
      const r = await post(t.url, body)
      process.stdout.write(`${t.url} ${p.replace(/\s/g,'')} ${r.status}\n`)
    }
  }
}

run()

