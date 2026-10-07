import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_HANDOFF, approvedFallbackReply, generateReply, isCromeQuestion } from '../src/routes/ai.js';

describe('Crome India assistant guardrails', () => {
  it('recognizes customer questions about company services and contact', () => {
    assert.equal(isCromeQuestion('Can you quote a cricket practice facility?'), true);
    assert.equal(isCromeQuestion('How can I reach your Bengaluru office?'), true);
  });
  it('routes unrelated requests directly to Crome India contact details', () => {
    assert.equal(isCromeQuestion('Can you explain the stock market?'), false);
    assert.equal(isCromeQuestion('Who won the cricket match?'), false);
    assert.match(CONTACT_HANDOFF, /sales@cromeindia\.com/);
    assert.match(CONTACT_HANDOFF, /\+91 96635 56752/);
  });
  it('requires a configured Gemini key', async () => {
    await assert.rejects(() => generateReply([{ role: 'user', content: 'Crome India cricket facility' }], { apiKey: '' }), { status: 503 });
  });
  it('sends the Gemini key in a header and extracts plain text', async () => {
    let request;
    const fetchImpl = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'We can help with that.' }] } }] }) }; };
    const answer = await generateReply([{ role: 'user', content: 'Crome India cricket infrastructure' }], { apiKey: 'test-key', fetchImpl });
    assert.equal(answer, 'We can help with that.');
    assert.match(request.url, /models\/gemini-3\.8-flash:generateContent$/);
    assert.equal(request.options.headers['x-goog-api-key'], 'test-key');
    assert.equal(JSON.parse(request.options.body).system_instruction.parts.length, 1);
  });
  it('answers from the published catalogue when the AI provider is unavailable', () => {
    const context=JSON.stringify({company:{markets:['Bangalore','Chennai']},products:[{name:'Bellin Prestige',sport:'Football',pileHeightMm:50},{name:'Cricket Turf',sport:'Cricket',pileHeightMm:9,specifications:{yarn:'Fibrillated yarn',gauge:'3/16'}}],sports:[{name:'Cricket',active:true}],faqs:[]});
    assert.match(approvedFallbackReply('What is Bellin Prestige pile height?',context),/50 mm pile height/);
    assert.match(approvedFallbackReply('What are Cricket Turf specifications?',context),/9 mm pile height, Fibrillated yarn, 3\/16/);
    assert.match(approvedFallbackReply('Where does Crome India serve?',context),/not confirmed branch offices/);
    assert.match(approvedFallbackReply('What warranty do you offer for Bellin Prestige?',context),/Other technical details are not confirmed/);
    assert.match(approvedFallbackReply('What is the cost of a football turf?',context),/sales@cromeindia\.com/);
  });
});
