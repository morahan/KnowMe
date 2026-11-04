import type { Habit, Moment, Reason } from '@/db/schema';
import { generateDemoMoments } from '@/lib/demoMoments';
import { buildSummary, classifyResponse, freeText } from './logic';
import { isReflectionSummary, SYSTEM_PROMPT, userMessage } from '../../../proxy/lib/prompt';

const habit: Habit = { id: 'h1', name: 'cannabis', kind: 'cannabis', question: null, created_at: '2026-11-01T00:00:00.000Z' };
const reasons: Reason[] = [{ id: 'r1', habit_id: null, text: 'Sleep better', sort_order: 0 }];
const SECRET = 'my private note about Sam';

function moment(over: Partial<Moment>): Moment {
  return {
    id: 'm', habit_id: 'h1', created_at: new Date(2026, 10, 2, 21, 0).toISOString(), intensity: 6,
    context: 'home', feelings: ['bored'], outcome: 'rode_it_out', helpers: ['tea'], note: SECRET, is_demo: false, ...over,
  };
}

const moments = [moment({}), moment({ outcome: 'used', intensity: 8, helpers: [] })];

describe('buildSummary', () => {
  it('keeps demo outcome literals and produces neutral reflection counts', () => {
    const demoMoments = generateDemoMoments(new Date(2026, 10, 4, 23)).map((entry, index) => (
      moment({ ...entry, id: `demo-${index}`, is_demo: true })
    ));
    const summary = buildSummary({ habits: [habit], reasons, moments: demoMoments, days: 21, includeNotes: false });
    expect(summary.timesYouDid).toBe(demoMoments.filter((entry) => entry.outcome === 'used').length);
    expect(summary.timesItPassed).toBe(demoMoments.filter((entry) => entry.outcome === 'rode_it_out').length);
    expect(summary.timesYouDid + summary.timesItPassed).toBe(summary.moments);
    expect(isReflectionSummary(summary)).toBe(true);
    expect(summary.topHelpers).toEqual(expect.arrayContaining(['tea', 'walk']));
  });

  it.each([false, true])('keeps question phrases local with includeNotes=%s', (includeNotes) => {
    const custom: Habit = { ...habit, kind: 'custom', name: 'Sugar', question: 'eat my secret snack' };
    const summary = buildSummary({ habits: [custom], reasons, moments, days: 7, includeNotes });
    expect(JSON.stringify(summary)).not.toContain(custom.question);
    expect(freeText(summary)).not.toContain(custom.question);
    expect(isReflectionSummary(summary)).toBe(true);
    expect(userMessage(summary)).not.toContain(custom.question);
  });

  it('uses the same neutral outcome contract as the proxy prompt', () => {
    const summary = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: false });
    const message = userMessage(summary);
    expect(message).toContain('timesItPassed:');
    expect(message).toContain('timesYouDid:');
    expect(message).not.toContain('- used:');
    expect(message).not.toContain('- rodeItOut:');
    expect(SYSTEM_PROMPT).toContain('"times it passed" and "times you did"');
    expect(isReflectionSummary({ ...summary, question: 'private phrase' })).toBe(false);
  });

  it('never includes raw notes when the toggle is off', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: false });
    expect(s.notes).toBeUndefined();
    expect(JSON.stringify(s)).not.toContain(SECRET);
  });

  it('includes notes only when the toggle is on', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: true });
    expect(s.notes).toEqual([SECRET, SECRET]);
  });

  it('counts outcomes, hours, intensity and helpers', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: false });
    expect(s.timesItPassed).toBe(1);
    expect(s.timesYouDid).toBe(1);
    expect(s).not.toHaveProperty('rodeItOut');
    expect(s).not.toHaveProperty('used');
    expect(s.byHour[21]).toBe(2);
    expect(s.averageIntensity).toBe(7);
    expect(s.topHelpers).toEqual(['tea']);
    expect(s.reasons).toEqual(['Sleep better']);
    // Two moments are too few to name a busiest stretch.
    expect(s.peakHours).toBeNull();
  });

  it('names the busiest stretch in plain words, as Patterns does', () => {
    const evening = [20, 21, 21, 22, 9].map((h, i) =>
      moment({ id: `e${i}`, created_at: new Date(2026, 10, 2 + i, h, 0).toISOString() }),
    );
    const s = buildSummary({ habits: [habit], reasons, moments: evening, days: 7, includeNotes: false });
    expect(s.peakHours).toBe('8pm to 11pm');
  });

  it('includes per-habit reasons once, alongside the universal ones', () => {
    const mixed: Reason[] = [
      ...reasons,
      { id: 'r2', habit_id: 'h1', text: 'For my lungs', sort_order: 0 },
      { id: 'r3', habit_id: 'h2', text: 'Sleep better', sort_order: 0 },
    ];
    const s = buildSummary({ habits: [habit], reasons: mixed, moments, days: 7, includeNotes: false });
    expect(s.reasons).toEqual(['Sleep better', 'For my lungs']);
  });

  it('exposes every free-text field to the crisis guard', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: true });
    expect(freeText(s)).toEqual(['cannabis', 'Sleep better', SECRET, SECRET]);
  });
});

// SAFETY.md test case: model output containing "CRISIS" shows the card.
// The proxy turns that token into { crisis: true }; the app must never render it as a letter.
describe('classifyResponse (SAFETY.md: CRISIS output shows the card)', () => {
  it('classifies a crisis response as crisis, never as a letter', () => {
    expect(classifyResponse({ crisis: true })).toEqual({ kind: 'crisis' });
  });

  it('splits a normal letter into lines', () => {
    const r = classifyResponse({ crisis: false, text: 'Evenings look hardest. Tea helped twice. What feels different then?' });
    expect(r.kind).toBe('letter');
    if (r.kind === 'letter') expect(r.lines).toHaveLength(3);
  });
});
