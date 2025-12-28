const fs = require('fs')
const path = require('path')
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'))

const base = process.env.EDGE_BASE || cfg.EDGE_BASE

async function login(email, password) {
  const res = await fetch(`${base}/login-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  return res.status
}

function genEmail(i) { return `user${i}@example.com` }

async function run() {
  const users = Array.from({ length: 200 }, (_, i) => ({ email: genEmail(i), password: 'password123' }))
  const start = Date.now()
  const results = await Promise.all(users.map(u => login(u.email, u.password)))
  const duration = Date.now() - start
  const ok = results.filter(s => s === 200).length
  const fail = results.length - ok
  process.stdout.write(`count=${results.length} ok=${ok} fail=${fail} ms=${duration}\n`)
}

run()

