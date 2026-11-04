import { POST } from './reflect';
import { screenForCrisis } from '../lib/screen';
import type { ReflectionSummary } from '../lib/prompt';

jest.mock('../lib/screen', () => ({ screenForCrisis: jest.fn(async () => false) }));

const summary: ReflectionSummary = {
  days: 7, habits: ['Sugar'], moments: 2, timesItPassed: 1, timesYouDid: 1,
  averageIntensity: 6, byHour: Array.from({ length: 24 }, () => 0), peakHours: null,
  topContexts: ['home'], topFeelings: [], topHelpers: ['tea'], reasons: ['Sleep better'],
};
const originalFetch = global.fetch;
const originalKey = process.env.LLAMA_API_KEY;
let requestNumber = 0;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.LLAMA_API_KEY = 'test-key';
  global.fetch = jest.fn(async () => Response.json({ choices: [{ message: { content: 'Tea appeared once. What felt different?' } }] }));
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.LLAMA_API_KEY;
  else process.env.LLAMA_API_KEY = originalKey;
  jest.restoreAllMocks();
});

function request(value: unknown) {
  requestNumber += 1;
  return new Request('https://example.test/api/reflect', {
    method: 'POST', body: JSON.stringify({ installId: `contract-test-${requestNumber}`, summary: value }),
  });
}

it('accepts the neutral count contract and sends matching guidance to Llama', async () => {
  const response = await POST(request(summary));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ crisis: false, text: 'Tea appeared once. What felt different?' });
  expect(screenForCrisis).toHaveBeenCalledTimes(1);
  const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(payload.messages[1].content).toContain('"timesItPassed":1');
  expect(payload.messages[1].content).toContain('"timesYouDid":1');
  expect(payload.messages[0].content).toContain('"times it passed" and "times you did"');
});

it.each([
  { ...summary, question: 'eat private snacks' },
  { ...summary, used: 1, rodeItOut: 1 },
  { ...summary, timesYouDid: -1 },
  { ...summary, timesItPassed: undefined },
])('rejects invalid or extra fields before model calls', async (value) => {
  const response = await POST(request(value));
  expect(response.status).toBe(400);
  expect(screenForCrisis).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
});

it('keeps crisis handling ahead of contract validation and network calls', async () => {
  const response = await POST(request({ ...summary, question: 'want to die' }));
  expect(await response.json()).toEqual({ crisis: true });
  expect(screenForCrisis).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
});
