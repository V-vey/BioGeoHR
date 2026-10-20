// Runs the JMeter load test for every load level, several runs per level, and prints the summary.
//
//   node tests/Load/run_load.cjs                       the paper's plan: 10, 25, 50, 75, 100, 150 users, 10 runs each
//   node tests/Load/run_load.cjs --levels=10 --runs=1  a quick smoke test
//   node tests/Load/run_load.cjs --summary-only        only re-read the results already in tests/Load/results
//
// Needs: the load database seeded (see LoadTestSeeder) and a backend running against it, for example
//   DB_DATABASE=biogeohr_load php artisan serve --host=127.0.0.1 --port=8090
// Options: --jmeter=<path to jmeter.bat> --host=127.0.0.1 --port=8090 --ramp=10 --levels=10,25 --runs=10
process.noDeprecation = true; // the shell option is only used to start jmeter.bat
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const backend = path.resolve(__dirname, '..', '..');
const plan = path.join(__dirname, 'biogeohr_load.jmx');
const tokens = path.join(backend, 'storage', 'app', 'loadtest', 'tokens.csv');
const results = path.join(__dirname, 'results');
const jmeter = arg('jmeter', path.join(process.env.USERPROFILE || '', 'Desktop', 'apache-jmeter-5.6.3', 'bin', 'jmeter.bat'));
const host = arg('host', '127.0.0.1');
const port = arg('port', '8090');
const ramp = arg('ramp', '10');
const levels = arg('levels', '10,25,50,75,100,150').split(',').map(Number);
const runs = Number(arg('runs', '10'));

// the paper's pass marks
const TARGET_SUCCESS = 99; // % at 100 users
const TARGET_AVG_MS = 3000; // ms at 100 users

// clear the clock-ins of the load-test employees, so every run starts from "nobody has clocked in today"
function resetAttendance() {
  const code = "DB::table('attendance_sessions')->delete(); DB::table('attendances')->delete(); DB::table('audit_logs')->delete();";
  const r = spawnSync('php', ['artisan', 'tinker', `--execute=${code}`], {
    cwd: backend,
    env: { ...process.env, DB_DATABASE: 'biogeohr_load' }, // never the real database
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error('could not reset the load database: ' + (r.stderr || r.stdout));
}

function runJMeter(users, run) {
  const out = path.join(results, `L${users}_R${run}.jtl`);
  const args = [
    '-n', '-f', '-t', `"${plan}"`, '-l', `"${out}"`,
    `-Jusers=${users}`, `-Jramp=${ramp}`, `-Jhost=${host}`, `-Jport=${port}`, `-Jtokens="${tokens}"`,
    '-Jjmeter.save.saveservice.output_format=csv',
  ];
  const r = spawnSync(`"${jmeter}"`, args, { shell: true, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`JMeter failed at ${users} users, run ${run}:\n${r.stdout}\n${r.stderr}`);
}

// a whole CSV text -> rows of fields. A field in double quotes may contain commas and line breaks,
// which JMeter's assertion failure messages do.
function parseCsv(text) {
  const rows = [];
  let row = [], cur = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// one .jtl file -> numbers
function readRun(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const head = rows[0];
  const [iElapsed, iOk, iLatency] = ['elapsed', 'success', 'Latency'].map((n) => head.indexOf(n));
  let n = 0, ok = 0, sum = 0, latency = 0, max = 0;
  const elapsed = [];
  for (const c of rows.slice(1)) {
    const ms = Number(c[iElapsed]);
    if (!Number.isFinite(ms)) continue;
    n += 1;
    if (c[iOk] === 'true') ok += 1;
    sum += ms;
    latency += Number(c[iLatency]) || 0;
    max = Math.max(max, ms);
    elapsed.push(ms);
  }
  elapsed.sort((a, b) => a - b);
  return { n, successPct: (ok / n) * 100, avgMs: sum / n, avgLatency: latency / n, maxMs: max, p95Ms: elapsed[Math.floor(elapsed.length * 0.95)] || 0 };
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

function summarize() {
  const files = fs.existsSync(results) ? fs.readdirSync(results).filter((f) => /^L\d+_R\d+\.jtl$/.test(f)) : [];
  const byLevel = {};
  for (const f of files) {
    const [, users] = /^L(\d+)_R(\d+)/.exec(f);
    (byLevel[users] ||= []).push(readRun(path.join(results, f)));
  }

  const rows = Object.keys(byLevel).map(Number).sort((a, b) => a - b).map((users) => {
    const r = byLevel[users];
    return {
      users, runs: r.length, requests: r[0].n,
      success: mean(r.map((x) => x.successPct)), avg: mean(r.map((x) => x.avgMs)),
      p95: mean(r.map((x) => x.p95Ms)), max: Math.max(...r.map((x) => x.maxMs)), wait: mean(r.map((x) => x.avgLatency)),
    };
  });

  console.log('\nUsers  Runs  Requests  Success %  Avg ms  P95 ms  Max ms  Avg wait ms');
  for (const r of rows) {
    console.log([r.users, r.runs, r.requests, r.success.toFixed(2), r.avg.toFixed(0), r.p95.toFixed(0), r.max, r.wait.toFixed(0)]
      .map((v, i) => String(v).padStart([5, 5, 8, 9, 6, 6, 6, 11][i] + (i ? 2 : 0))).join(''));
  }
  const at100 = rows.find((r) => r.users === 100);
  if (at100) {
    const okS = at100.success >= TARGET_SUCCESS, okA = at100.avg <= TARGET_AVG_MS;
    console.log(`\nAt 100 users: success ${at100.success.toFixed(2)}% (target >= ${TARGET_SUCCESS}%) -> ${okS ? 'PASS' : 'FAIL'}; average ${at100.avg.toFixed(0)} ms (target <= ${TARGET_AVG_MS} ms) -> ${okA ? 'PASS' : 'FAIL'}`);
  }
  fs.writeFileSync(path.join(results, 'summary.csv'),
    'users,runs,requests,success_pct,avg_ms,p95_ms,max_ms,avg_wait_ms\n' +
    rows.map((r) => [r.users, r.runs, r.requests, r.success.toFixed(2), r.avg.toFixed(0), r.p95.toFixed(0), r.max, r.wait.toFixed(0)].join(',')).join('\n') + '\n');
  console.log(`\nSaved ${path.join(results, 'summary.csv')}`);
}

fs.mkdirSync(results, { recursive: true });
if (!process.argv.includes('--summary-only')) {
  if (!fs.existsSync(jmeter)) throw new Error(`JMeter not found at ${jmeter}. Pass --jmeter=<path to jmeter.bat>.`);
  if (!fs.existsSync(tokens)) throw new Error('No tokens.csv. Run: DB_DATABASE=biogeohr_load php artisan db:seed --class=LoadTestSeeder');
  for (const users of levels) {
    for (let run = 1; run <= runs; run++) {
      resetAttendance();
      process.stdout.write(`${users} users, run ${run}/${runs} ... `);
      runJMeter(users, run);
      console.log('done');
    }
  }
}
summarize();
