import { describe, it, expect } from 'vitest';
import { analyzeQueryComplexity, selectModelForBudget } from '../src/router';

describe('Query Router', () => {
  describe('analyzeQueryComplexity', () => {
    it('should detect simple queries', () => {
      const result = analyzeQueryComplexity('What is AI?');

      expect(result.complexity).toBe('simple');
      expect(result.recommendedModel).toBe('gemini');
    });

    it('should detect complex code queries', () => {
      const result = analyzeQueryComplexity(
        'Implement a function to calculate the shortest path in a graph using Dijkstra algorithm'
      );

      expect(result.complexity).toBe('complex');
      expect(result.recommendedModel).toBe('claude');
    });

    it('should detect moderate analysis queries', () => {
      const result = analyzeQueryComplexity(
        'Compare the performance of different sorting algorithms'
      );

      expect(result.complexity).toBe('complex');
      expect(result.recommendedModel).toBe('claude');
    });

    it('should handle empty queries', () => {
      const result = analyzeQueryComplexity('');

      expect(result.complexity).toBe('simple');
      expect(result.recommendedModel).toBe('gemini');
    });
  });

  describe('selectModelForBudget', () => {
    it('should always use Gemini for low budget', () => {
      expect(selectModelForBudget('simple', 'low')).toBe('gemini');
      expect(selectModelForBudget('moderate', 'low')).toBe('gemini');
      expect(selectModelForBudget('complex', 'low')).toBe('gemini');
    });

    it('should balance quality and cost for medium budget', () => {
      expect(selectModelForBudget('simple', 'medium')).toBe('gemini');
      expect(selectModelForBudget('moderate', 'medium')).toBe('gemini');
      expect(selectModelForBudget('complex', 'medium')).toBe('gpt4');
    });

    it('should use best models for high budget', () => {
      expect(selectModelForBudget('simple', 'high')).toBe('gemini');
      expect(selectModelForBudget('moderate', 'high')).toBe('gpt4');
      expect(selectModelForBudget('complex', 'high')).toBe('claude');
    });
  });
});
