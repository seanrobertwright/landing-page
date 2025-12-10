import { describe, it, expect } from 'vitest';
import { highlightMatches } from './highlight';

describe('highlightMatches', () => {
  it('should return single segment with no highlight for empty query', () => {
    const result = highlightMatches('test text', '');
    expect(result).toEqual([{ text: 'test text', highlight: false }]);
  });

  it('should return single segment with no highlight for whitespace query', () => {
    const result = highlightMatches('test text', '   ');
    expect(result).toEqual([{ text: 'test text', highlight: false }]);
  });

  it('should highlight single match', () => {
    const result = highlightMatches('hello world', 'world');
    expect(result).toEqual([
      { text: 'hello ', highlight: false },
      { text: 'world', highlight: true },
    ]);
  });

  it('should highlight multiple matches', () => {
    const result = highlightMatches('test test test', 'test');
    expect(result.length).toBe(5); // test, space, test, space, test
    expect(result[0]).toEqual({ text: 'test', highlight: true });
    expect(result[2]).toEqual({ text: 'test', highlight: true });
    expect(result[4]).toEqual({ text: 'test', highlight: true });
  });

  it('should be case insensitive', () => {
    const result = highlightMatches('GitHub Repository', 'git');
    expect(result[0]).toEqual({ text: 'Git', highlight: true });
  });

  it('should handle partial matches', () => {
    const result = highlightMatches('github.com', 'git');
    expect(result[0]).toEqual({ text: 'git', highlight: true });
  });

  it('should escape special regex characters', () => {
    const result = highlightMatches('test.com (site)', '.');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle special characters in query', () => {
    const result = highlightMatches('100% complete', '100%');
    expect(result[0]).toEqual({ text: '100%', highlight: true });
  });

  it('should handle Unicode characters', () => {
    const result = highlightMatches('测试 test 测试', '测试');
    expect(result[0]).toEqual({ text: '测试', highlight: true });
    expect(result[2]).toEqual({ text: '测试', highlight: true });
  });

  it('should filter empty segments', () => {
    const result = highlightMatches('test', 'test');
    expect(result).toEqual([{ text: 'test', highlight: true }]);
    expect(result.every((seg) => seg.text.length > 0)).toBe(true);
  });
});
