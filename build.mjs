import { build, context } from 'esbuild';
import { mkdirSync } from 'node:fs';

const watch = process.argv.includes('--watch');
mkdirSync('build', { recursive: true });

const common = {
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  target: ['es2020', 'chrome90', 'safari15', 'firefox90'],
  logLevel: 'info',
  loader: { '.svg': 'text' },
};

const jobs = [
  { ...common, entryPoints: ['src/js/index.js'], outfile: 'build/site.min.js', format: 'iife' },
  { ...common, entryPoints: ['src/css/index.css'], outfile: 'build/site.min.css' },
];

if (watch) {
  for (const job of jobs) (await context(job)).watch();
  console.log('watch: слежу за src/ — Ctrl+C чтобы остановить');
} else {
  await Promise.all(jobs.map(build));
  console.log('готово: build/site.min.js + build/site.min.css');
}
