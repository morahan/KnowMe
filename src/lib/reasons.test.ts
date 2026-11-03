import type { Reason } from '@/db/schema';
import { allReasonTexts, reasonTextsFor, universalReasons, visibleReasons } from './reasons';

const r = (id: string, habit_id: string | null, text: string, sort_order = 0): Reason => ({ id, habit_id, text, sort_order });

const uni = [r('u1', null, 'Sleep better', 0), r('u2', null, 'Be present', 1)];
const tagged = [r('t1', 'h1', 'For my lungs', 0), r('t2', 'h1', 'Save money', 1)];
const all = [...uni, ...tagged, r('t3', 'h2', 'Clear head', 0)];

describe('visibleReasons', () => {
  it('shows the universal list by default', () => {
    expect(visibleReasons(all, 'h-with-none', 2).map((x) => x.text)).toEqual(['Sleep better', 'Be present']);
    expect(visibleReasons(all, null, 2)).toEqual(universalReasons(all));
  });
  it('shows a habit its own list when tracking more than one', () => {
    expect(visibleReasons(all, 'h1', 2).map((x) => x.text)).toEqual(['For my lungs', 'Save money']);
  });
  it('hides tagged lists when only one habit is tracked', () => {
    expect(visibleReasons(all, 'h1', 1).map((x) => x.text)).toEqual(['Sleep better', 'Be present']);
    expect(visibleReasons(all, 'h1', 0).map((x) => x.text)).toEqual(['Sleep better', 'Be present']);
  });
});

describe('reasonTextsFor / allReasonTexts', () => {
  it('reads the universal and tagged lists separately', () => {
    expect(reasonTextsFor(all, null)).toEqual(['Sleep better', 'Be present']);
    expect(reasonTextsFor(all, 'h1')).toEqual(['For my lungs', 'Save money']);
    expect(reasonTextsFor(all, 'nope')).toEqual([]);
  });
  it('dedupes across lists, universal first', () => {
    const dup = [...all, r('t4', 'h2', 'Sleep better', 1)];
    expect(allReasonTexts(dup)).toEqual(['Sleep better', 'Be present', 'For my lungs', 'Save money', 'Clear head']);
  });
});
