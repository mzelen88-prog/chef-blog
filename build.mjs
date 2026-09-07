import { build, context } from 'esbuild';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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

// Собирает страницу превью из тех же снипетов, что уйдут в Тильду,
// чтобы локальный вид не расходился с боевым.
function buildPreviewPage(dir, title, outFile) {
  const src = join('blocks', dir);
  const blocks = readdirSync(src).filter((f) => f.endsWith('.html')).sort();
  const body = blocks
    .map((f, i) => {
      const html = readFileSync(join(src, f), 'utf8');
      return `<div class="t-rec" id="rec2000000${i + 1}">
  <p class="pv-label">${f}</p>
${html}
</div>`;
    })
    .join('\n\n');

  writeFileSync(
    outFile,
    readFileSync('preview/_template.html', 'utf8')
      .replace('{{TITLE}}', title)
      .replace('{{BODY}}', body)
  );
  console.log('превью собрано:', outFile);
}

if (watch) {
  for (const job of jobs) (await context(job)).watch();
  buildPreviewPage('dinner-2026-09-18', 'Гастро-ужин в Ферменто', 'preview/dinner.html');
  console.log('watch: слежу за src/ — Ctrl+C чтобы остановить');
} else {
  await Promise.all(jobs.map(build));
  buildPreviewPage('dinner-2026-09-18', 'Гастро-ужин в Ферменто', 'preview/dinner.html');
  console.log('готово: build/site.min.js + build/site.min.css');
}
