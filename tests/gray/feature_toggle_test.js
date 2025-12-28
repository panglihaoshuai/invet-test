const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'))

const supabase = createClient(process.env.SUPABASE_URL || cfg.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || cfg.SUPABASE_SERVICE_ROLE_KEY)

async function setFlag(v) {
  await supabase.from('system_config').update({ value: v ? 'true' : 'false' }).eq('key', 'deepseek_enabled')
}

async function run() {
  await setFlag(true)
  process.stdout.write('on\n')
  await setFlag(false)
  process.stdout.write('off\n')
}

run()
