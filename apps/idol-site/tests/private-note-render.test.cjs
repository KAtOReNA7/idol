'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const ts = require('typescript');

test('actual personal-note JSX preserves audit-like words verbatim in notes and memories', () => {
  const sentinel = '我的原话：未知、待核、核验、来源不足，喜欢这段表现。';
  const record = {note: sentinel, memory: sentinel};
  const components = {
    'components/catalog/work-detail.tsx': ['r.memory', 'r.note', 'work.note'],
    'components/catalog/member-detail.tsx': ['m.note'],
    'components/group-detail.tsx': ['g.note'],
  };
  const noteClasses = new Set(['my-note', 'cast-note', 'memory']);
  for (const [file, expected] of Object.entries(components)) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fields = new Set();
    function visit(node) {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === 'p') {
        const cls = node.openingElement.attributes.properties.find(
          attr => ts.isJsxAttribute(attr) && attr.name.getText(ast) === 'className'
        );
        if (cls?.initializer && ts.isStringLiteral(cls.initializer) && noteClasses.has(cls.initializer.text)) {
          const [child] = node.children;
          assert.ok(node.children.length === 1 && ts.isJsxExpression(child) && child.expression, file);
          fields.add(child.expression.getText(ast));
          const js = ts.transpileModule('(' + node.getText(ast) + ')', {
            compilerOptions: {jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022},
          }).outputText;
          const paragraph = vm.runInNewContext(js, {React, work: record, m: record, g: record, r: record});
          assert.equal(paragraph.props.children, sentinel, file);
          assert.ok(renderToStaticMarkup(paragraph).includes(sentinel), file);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.deepEqual([...fields].sort(), expected, file);
  }
});
