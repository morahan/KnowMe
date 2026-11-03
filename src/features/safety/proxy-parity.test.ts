import { CRISIS_TERMS } from './crisisTerms';
// The proxy deploys separately and keeps its own copy (DECISIONS.md).
// This test is the guard that the two copies never drift apart.
import { inputIsCrisis, isCrisis as proxyIsCrisis, outputIsCrisis } from '../../../proxy/lib/crisis';
import { allow } from '../../../proxy/lib/rateLimit';

describe('proxy crisis parity', () => {
  it('flags every app crisis term', () => {
    for (const term of CRISIS_TERMS) {
      expect(proxyIsCrisis(`feeling like ${term} today`)).toBe(true);
    }
  });

  it('does not flag ordinary text', () => {
    expect(proxyIsCrisis('Had tea and went for a walk')).toBe(false);
    expect(inputIsCrisis({ reasons: ['Sleep better'], notes: ['rough evening'] })).toBe(false);
  });

  it('flags crisis anywhere in the summary', () => {
    expect(inputIsCrisis({ reasons: ['I want to die'] })).toBe(true);
  });

  it('flags the CRISIS token and crisis language in model output', () => {
    expect(outputIsCrisis('CRISIS')).toBe(true);
    expect(outputIsCrisis('You mentioned you want to die last week.')).toBe(true);
    expect(outputIsCrisis('Evenings look hardest. What helps then?')).toBe(false);
  });
});

describe('proxy rate limit', () => {
  it('allows up to the window cap, then refuses', () => {
    const id = `test-${Date.now()}`;
    for (let i = 0; i < 10; i++) expect(allow(id, 1_000_000 + i)).toBe(true);
    expect(allow(id, 1_000_100)).toBe(false);
    expect(allow(id, 1_000_000 + 60 * 60 * 1000 + 1)).toBe(true);
  });
});
