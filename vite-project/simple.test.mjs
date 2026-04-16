import test from 'node:test';
import assert from 'node:assert';

test('Frontend Logic: проверка валидации бюджета', () => {
  const validateBudget = (value) => value >= 0;
  
  assert.strictEqual(validateBudget(100), true);
  
  assert.strictEqual(validateBudget(-50), false);
});

test('Frontend Logic: проверка дат поездки', () => {
  const isDateOrderValid = (start, end) => new Date(end) >= new Date(start);
  
  assert.strictEqual(isDateOrderValid('2026-05-01', '2026-05-10'), true);
  assert.strictEqual(isDateOrderValid('2026-05-10', '2026-05-01'), false);
});