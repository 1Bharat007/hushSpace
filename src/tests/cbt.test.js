import test from 'node:test';
import assert from 'node:assert/strict';
import { CLINICAL_PROTOCOLS, COGNITIVE_DISTORTIONS } from '../lib/cbt/prompts.js';

test('Clinical CBT Suite — Protocol definitions and templates', () => {
  assert.ok(CLINICAL_PROTOCOLS.length >= 5);
  for (const proto of CLINICAL_PROTOCOLS) {
    assert.ok(proto.id);
    assert.ok(proto.title);
    assert.ok(proto.category);
    assert.ok(proto.template);
    assert.ok(proto.template.includes('## '));
  }
});

test('Clinical CBT Suite — Cognitive Distortion taxonomies', () => {
  assert.ok(COGNITIVE_DISTORTIONS.length >= 6);
  const ids = COGNITIVE_DISTORTIONS.map((d) => d.id);
  assert.ok(ids.includes('catastrophizing'));
  assert.ok(ids.includes('all_or_nothing'));
  assert.ok(ids.includes('mind_reading'));
});
