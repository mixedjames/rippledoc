import { expect, test } from 'vitest';
import { test as f_to_test } from './main.ts';

test('The meaning of life', () => {
  expect(f_to_test('anything')).toBe(42);
});
