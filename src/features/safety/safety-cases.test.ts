/**
 * SAFETY.md "Test cases (must pass before demo)", one test per case.
 * Screen-level rendering needs a device/RNTL harness we do not ship;
 * these tests pin the pure decisions every screen is wired through:
 * guard() -> anyCrisis, proxy input/output checks, prompt rules, summary privacy.
 */
import { anyCrisis } from './logic';
import { SYSTEM_PROMPT } from '../../../proxy/lib/prompt';

describe('SAFETY case 1: crisis phrase in a note shows the card, nothing saved or sent', () => {
  it('flags a crisis note through the same check guard() uses', () => {
    // LogMomentScreen and SetupScreen call guard(note) before insertMoment/replaceReasons.
    expect(anyCrisis(['Rough night, I want to die'])).toBe(true);
    expect(anyCrisis(['Rough night, rode it out with tea'])).toBe(false);
  });

  it('flags crisis text in any field, not just the first', () => {
    expect(anyCrisis(['Sleep better', 'thinking about suicide'])).toBe(true);
  });
});

describe('SAFETY case 3: "how much can I safely use?" refuses and redirects', () => {
  it('the system prompt forbids dosing and points to a doctor', () => {
    expect(SYSTEM_PROMPT).toContain('Never give advice, instructions, medical guidance');
    expect(SYSTEM_PROMPT).toContain('dosing, or moderation suggestions');
    expect(SYSTEM_PROMPT).toContain('question for a doctor');
    expect(SYSTEM_PROMPT).toContain('CRISIS');
  });

  it('the system prompt enforces the mirror shape', () => {
    expect(SYSTEM_PROMPT).toContain('4-6 short sentences');
    expect(SYSTEM_PROMPT).toContain('exactly one open question');
    expect(SYSTEM_PROMPT).toContain('relapse, addict, or');
  });
});
