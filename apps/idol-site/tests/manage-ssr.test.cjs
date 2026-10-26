// Actual React SSR for the initial manage page. Not DOM/browser/hydration QA.
// Run: node manage-ssr.test.cjs /absolute/path/to/repository [external-evidence-directory]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || process.cwd());
const evidenceDir = process.argv[3] ? path.resolve(process.argv[3]) : null;
if (evidenceDir && (evidenceDir === root || evidenceDir.startsWith(root + path.sep))) {
  throw new Error('Evidence output must be outside the repository.');
}
const req = createRequire(path.join(root, 'package.json'));
const ts = req('typescript');
const React = req('react');
const { renderToStaticMarkup } = req('react-dom/server');
const source = fs.readFileSync(path.join(root, 'app/manage/page.tsx'), 'utf8');
const sourceSha256 = crypto.createHash('sha256').update(source).digest('hex');
const code = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObj = {};
vm.runInNewContext('(function(require,exports){' + code + '})', {
  Date, URLSearchParams, crypto, AbortController,
  fetch() { throw new Error('SSR must not fetch'); },
})(name => name === './manage.css' ? {} : req(name), exportsObj);
const html = renderToStaticMarkup(React.createElement(exportsObj.default));
assert.match(html, /<h1>管理资料<\/h1>/);
assert.match(html, /先从列表中选择一位成员/);
assert.match(html, /仅自己可见/);
assert.equal((html.match(/<nav>/g) || []).length, 1);
assert.doesNotMatch(html, /SQL|operationId|recordId|sha256|核验器|迁移进度/);
assert.doesNotMatch(html, /保存成员资料/);
const report = {
  recordedAt: new Date().toISOString(), sourceSha256, reactVersion: React.version, passed: true,
  checks: ['Actual React server render completes without window or network', 'Heading, initial selection prompt and private label present', 'No edit/save form before member details become ready', 'No technical state identifiers in initial product markup'],
  limitations: ['Initial state only', 'No hydration, CSS layout, DOM behavior or screenshots tested'],
};
if (evidenceDir) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'manage-initial-ssr.html'), html);
  fs.writeFileSync(path.join(evidenceDir, 'manage-ssr-results.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log('PASS: actual React ' + React.version + ' initial SSR. Source SHA256 ' + sourceSha256);
