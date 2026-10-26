'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync('components/artist-timeline.css','utf8');
// CSS contracts complement, but do not replace, computed-style browser QA.
test('one lightweight timeline inherits artist foreground and decorative theme accents',()=>{
 assert.match(css,/\.artist-timeline \{[\s\S]*?color: inherit;/);
 assert.match(css,/--at-accent: var\(--artist-timeline-accent, var\(--ca-accent, currentColor\)\)/);
 assert.match(css,/\.lesserafim-artist \.artist-timeline \{ --artist-timeline-accent: var\(--lf-orange\)/);
 assert.match(css,/\.artist-timeline \.at-event \{[^}]*border: 0; background: transparent; color: inherit/);
 assert.doesNotMatch(css,/(?:^|\n)(?:body|html)\s*\{/);
 assert.doesNotMatch(css,/\.at-filters|\.at-sources|\.at-badges/);
});
test('short name links remain readable, keyboard-focusable and touch-sized',()=>{
 assert.match(css,/button:hover \{[^}]*min-height: 44px;[^}]*background: transparent; color: inherit/);
 assert.match(css,/text-decoration: underline/);
 assert.match(css,/outline: 3px solid var\(--at-focus\)/);
});
