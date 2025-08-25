import { describe, it, expect } from 'vitest';
import { Optional } from './optional';

describe('Optional', () => {
  describe('makeFrom', () => {
    it('wraps a non-null value', () => {
      const opt = Optional.makeFrom(42);
      expect(opt.present()).toBe(true);
      expect(opt.get()).toBe(42);
    });

    it('treats null/undefined as empty', () => {
      expect(Optional.makeFrom(null).present()).toBe(false);
      expect(Optional.makeFrom(undefined).present()).toBe(false);
    });
  });

  describe('makeEmpty', () => {
    it('creates an empty optional', () => {
      const opt = Optional.makeEmpty<number>();
      expect(opt.present()).toBe(false);
    });
  });

  describe('get', () => {
    it('returns value if present', () => {
      const opt = Optional.makeFrom('hello');
      expect(opt.get()).toBe('hello');
    });

    it('throws if empty', () => {
      const opt = Optional.makeEmpty<string>();
      expect(() => opt.get()).toThrow('Optional<T>: cannot get a missing value');
    });
  });

  describe('getOrDefault', () => {
    it('returns contained value if present', () => {
      const opt = Optional.makeFrom(10);
      expect(opt.getOrDefault(99)).toBe(10);
    });

    it('returns given default value if empty', () => {
      const opt = Optional.makeEmpty<number>();
      expect(opt.getOrDefault(99)).toBe(99);
    });

    it('calls supplier function if empty', () => {
      const opt = Optional.makeEmpty<number>();
      expect(opt.getOrDefault(() => 123)).toBe(123);
    });

    it('does not call supplier if present', () => {
      let called = false;
      const opt = Optional.makeFrom(5);
      const result = opt.getOrDefault(() => {
        called = true;
        return 99;
      });
      expect(result).toBe(5);
      expect(called).toBe(false);
    });
  });

  describe('present', () => {
    it('returns true if value is present', () => {
      expect(Optional.makeFrom('hi').present()).toBe(true);
    });

    it('returns false if empty', () => {
      expect(Optional.makeEmpty<string>().present()).toBe(false);
    });
  });

  describe('ifPresent', () => {
    it('runs callback when value is present', () => {
      let result = 0;
      const opt = Optional.makeFrom(7);
      opt.ifPresent((v) => (result = v));
      expect(result).toBe(7);
    });

    it('does nothing if empty', () => {
      let result = 0;
      const opt = Optional.makeEmpty<number>();
      opt.ifPresent((v) => (result = v));
      expect(result).toBe(0);
    });

    it('is chainable', () => {
      const opt = Optional.makeFrom(5);
      expect(opt.ifPresent(() => {}).get()).toBe(5);
    });
  });

  describe('orElseThrow', () => {
    it('returns self if value present', () => {
      const opt = Optional.makeFrom('hi');
      expect(opt.orElseThrow(() => new Error()).get()).toBe('hi');
    });

    it('throws supplied error if empty', () => {
      const opt = Optional.makeEmpty<string>();
      expect(() => opt.orElseThrow(() => new Error('missing'))).toThrow('missing');
    });
  });

  describe('orElse', () => {
    it('runs callback if empty', () => {
      let called = false;
      const opt = Optional.makeEmpty<number>();
      opt.orElse(() => {
        called = true;
      });
      expect(called).toBe(true);
    });

    it('does not run callback if value present', () => {
      let called = false;
      const opt = Optional.makeFrom(1);
      opt.orElse(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('is chainable', () => {
      const opt = Optional.makeFrom(10);
      expect(opt.orElse(() => {}).get()).toBe(10);
    });
  });

  describe('map', () => {
    it('transforms value when present', () => {
      const opt = Optional.makeFrom(3).map((v) => v * 2);
      expect(opt.get()).toBe(6);
    });

    it('returns empty when original is empty', () => {
      const opt = Optional.makeEmpty<number>().map((v) => v * 2);
      expect(opt.present()).toBe(false);
    });

    it('maps to null results in empty', () => {
      const opt = Optional.makeFrom(3).map(() => null);
      expect(opt.present()).toBe(false);
    });
  });

  describe('flatMap', () => {
    it('flattens nested optionals', () => {
      const opt = Optional.makeFrom(3).flatMap((v) => Optional.makeFrom(v * 2));
      expect(opt.get()).toBe(6);
    });

    it('returns empty if original is empty', () => {
      const opt = Optional.makeEmpty<number>().flatMap((v) => Optional.makeFrom(v * 2));
      expect(opt.present()).toBe(false);
    });

    it('returns empty if function returns empty', () => {
      const opt = Optional.makeFrom(3).flatMap(() => Optional.makeEmpty<number>());
      expect(opt.present()).toBe(false);
    });
  });
});
