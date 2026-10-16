/**
 * TEST ONLY. Import into a real browser host with the project's React/CSS build.
 * No browser, layout, keyboard or timing results have been executed by Sol.
 */
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {PersonalInsights} from '../../components/personal-insights/PersonalInsights';
import type {CatalogView} from '../../lib/idol/types';
import {catalog, group, member, rating, stage, work} from './fixtures';

export interface BrowserCheckResult {name: string; status: 'passed' | 'failed'; detail?: string;}
function requireCondition(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(item => item.getAttribute('aria-label') === label || item.textContent?.trim() === label);
  requireCondition(button, 'Missing button: ' + label);
  return button;
}
function fixture(size: number): CatalogView {
  return catalog({
    groups: Array.from({length: size}, (_, i) => group('g-' + i)),
    members: Array.from({length: size}, (_, i) => member('m-' + i)),
    works: Array.from({length: size}, (_, i) => work('w-' + i, {
      groupIds: ['g-' + i], ratingIds: ['r-' + i], stage: stage(),
      stageScore: 10, score: i === 0 ? null : 9, watched: '已观看',
      name: 'TEST ONLY browser work ' + i, version: 'TEST ONLY version ' + i,
    })),
    ratings: Array.from({length: size}, (_, i) => rating('r-' + i, {
      memberIds: ['m-' + i], workIds: ['w-' + i], score: 0, stylingScore: 10,
    })),
  });
}
const settle = () => new Promise<void>(resolve =>
  requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * Call with a connected, empty element inside an isolated TEST ONLY browser page.
 * Run at each actual viewport 390, 768 and 1280; it does not resize the window.
 * Returned statuses are produced only by an actual invocation, never prefilled.
 * This covers click/focus behavior; trusted Tab/arrow/screen-reader checks remain
 * separate manual steps in TEST_PLAN.json.
 */
export async function runPersonalInsightsBrowserChecks(
  container: HTMLElement,
): Promise<BrowserCheckResult[]> {
  requireCondition(container.isConnected && container.childNodes.length === 0,
    'Use a connected empty TEST ONLY container');
  const root = createRoot(container), results: BrowserCheckResult[] = [];
  const calls: {kind: string; id: string}[] = [];
  const data = fixture(25);
  function render(input: CatalogView, disabled = false, key = 'stable') {
    flushSync(() => root.render(<PersonalInsights key={key} catalog={input}
      memberLabel={item => item.name}
      isStageScoreEligible={() => true}
      disabled={disabled}
      onGroup={id => calls.push({kind: 'group', id})}
      onMember={id => calls.push({kind: 'member', id})}
      onWork={id => calls.push({kind: 'work', id})}/>));
  }
  async function check(name: string, action: () => void | Promise<void>) {
    try {await action(); results.push({name, status: 'passed'});}
    catch (error) {results.push({name, status: 'failed',
      detail: error instanceof Error ? error.message : String(error)});}
  }
  try {
    render(data);
    await settle();
    await check('native tables and readable histogram', () => {
      requireCondition(container.querySelector('table caption'), 'Missing table caption');
      requireCondition(container.querySelector('th[scope="col"]'), 'Missing column headers');
      requireCondition(container.querySelectorAll('.pi-histogram-bars > li').length === 11,
        'Histogram must expose all eleven bins');
    });
    await check('group host callback preserves canonical identity', () => {
      const button = container.querySelector<HTMLButtonElement>('.pi-group-table tbody button');
      requireCondition(button, 'Missing group navigation');
      const before = calls.length; button.click();
      requireCondition(calls.length === before + 1 && calls[calls.length - 1].kind === 'group'
        && calls[calls.length - 1].id === 'g-1',
        'Expected exactly one canonical group callback');
    });
    await check('disabled callbacks remain silent', async () => {
      render(data, true); await settle();
      const before = calls.length;
      for (const selector of ['.pi-group-table tbody button', '.pi-member-table tbody .pi-text-button',
        '.pi-revisit-list button']) {
        const button = container.querySelector<HTMLButtonElement>(selector);
        requireCondition(button?.disabled, 'Navigation must be disabled: ' + selector);
        button.click();
      }
      requireCondition(calls.length === before, 'Disabled callback was invoked');
      render(data); await settle();
    });
    await check('paging moves focus to the corresponding heading', async () => {
      flushSync(() => findButton(container, '团体比较下一页').click());
      await settle();
      requireCondition(document.activeElement === container.querySelector('[id$="-groups"]'),
        'Group page focus did not land on heading');
      requireCondition(container.querySelectorAll('.pi-group-table tbody tr').length === 10,
        'Expected a bounded second page');
    });
    await check('stage scope does not relabel MV pending reviews', async () => {
      const stageRadio = container.querySelector<HTMLInputElement>('input[value="stage"]');
      requireCondition(stageRadio, 'Missing stage control');
      flushSync(() => stageRadio.click()); await settle();
      requireCondition(container.querySelector('[id$="-groups"]')?.textContent?.includes('舞台'),
        'Stage group scope did not update');
      const pending = container.querySelector<HTMLInputElement>('input[value="watched-unrated"]');
      requireCondition(pending, 'Missing MV pending control');
      flushSync(() => pending.click()); await settle();
      requireCondition(container.querySelector('[id$="-revisit"]')?.textContent === 'MV 已看待评',
        'MV viewing status must remain MV');
      requireCondition(container.querySelectorAll('.pi-revisit-list > li').length === 1,
        'Expected only the explicit-null watched MV');
    });
    await check('member host callback preserves canonical identity', () => {
      const button = container.querySelector<HTMLButtonElement>('.pi-member-table tbody .pi-text-button');
      requireCondition(button, 'Missing member navigation');
      const before = calls.length; button.click();
      requireCondition(calls.length === before + 1 && calls[calls.length - 1].kind === 'member'
        && calls[calls.length - 1].id === 'm-0', 'Expected the selected canonical member');
    });
    await check('member trace opens and close returns focus', async () => {
      const trigger = container.querySelector<HTMLButtonElement>('.pi-member-table button[aria-expanded]');
      requireCondition(trigger, 'Missing member trace trigger');
      flushSync(() => trigger.click()); await settle();
      requireCondition(document.activeElement === container.querySelector('[id$="-trace-title"]'),
        'Trace heading did not receive focus');
      const workButton = container.querySelector<HTMLButtonElement>('.pi-trace-list button');
      requireCondition(workButton, 'Missing trace work navigation');
      const before = calls.length; workButton.click();
      requireCondition(calls.length === before + 1 && calls[calls.length - 1].kind === 'work'
        && calls[calls.length - 1].id === 'w-0',
        'Trace did not call the host work callback');
      flushSync(() => findButton(container, '收起作品').click()); await settle();
      requireCondition(document.activeElement === trigger, 'Trace close did not return focus');
    });
    await check('same-object refresh invalidates statistics', async () => {
      const mvRadio = container.querySelector<HTMLInputElement>('input[value="mv"]');
      requireCondition(mvRadio, 'Missing MV control');
      flushSync(() => mvRadio.click()); await settle();
      data.works[0].score = 0;
      render(data); await settle();
      const values = [...container.querySelectorAll('.pi-summary dd')].map(item => item.textContent);
      requireCondition(values[0] === '25' && values[1] === '8.64',
        'Same catalog identity retained stale statistics');
    });
    await check('shrinking data clamps an existing later page', async () => {
      flushSync(() => findButton(container, '团体比较下一页').click()); await settle();
      data.works.splice(1);
      render(data); await settle();
      requireCondition(container.querySelectorAll('.pi-group-table tbody tr').length === 1,
        'Shrinking data left an empty out-of-range page');
    });
    await check('5000-work rendering remains bounded', async () => {
      render(fixture(5000), false, 'scale-5000'); await settle();
      requireCondition(container.querySelectorAll('.pi-group-table tbody tr').length <= 10,
        'Unbounded group DOM');
      requireCondition(container.querySelectorAll('.pi-member-table tbody tr').length <= 10,
        'Unbounded member DOM');
      requireCondition(container.querySelectorAll('.pi-revisit-list > li').length <= 10,
        'Unbounded revisit DOM');
    });
    await check('current real viewport contains the outer panel', () => {
      const insights = container.querySelector<HTMLElement>('.pi-insights');
      requireCondition(insights && insights.clientWidth > 0, 'Fixture must be visible');
      requireCondition(insights.scrollWidth <= insights.clientWidth + 1,
        'Outer panel overflows; tables should scroll inside their wrappers');
    });
    return results;
  } finally {
    flushSync(() => root.unmount());
  }
}
