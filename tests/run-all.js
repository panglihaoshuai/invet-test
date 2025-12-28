const { execSync } = require('child_process')
function run(cmd) { execSync(cmd, { stdio: 'inherit' }) }
run('node tests/security/injection_test.cjs')
run('node tests/gray/feature_toggle_test.js')
run('node tests/perf/stress_login.cjs')
run('node tests/perf/stress_deepseek.cjs')
