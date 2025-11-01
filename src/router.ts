// 멀티 모델 라우팅 - 쿼리 복잡도에 따라 적절한 AI 모델 선택

interface QueryAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'realtime';
  recommendedModel: 'gemini' | 'gpt4' | 'claude' | 'o1' | 'gemini-pro' | 'perplexity';
  reasoning: string;
}

export function analyzeQueryComplexity(query: string): QueryAnalysis {
  const wordCount = query.split(/\s+/).length;
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
  const hasCodeRequest = /code|implement|function|class|algorithm/i.test(query);
  const hasAnalysisRequest = /analyze|compare|evaluate|assess|explain/i.test(query);
  const hasCreativeRequest = /create|design|imagine|brainstorm/i.test(query);
  const hasMathRequest = /prove|theorem|equation|calculate|solve/i.test(query);
  const hasResearchRequest = /research|study|investigate|explore/i.test(query);
  const hasCurrentRequest = /today|now|current|latest|recent|2025|news/i.test(query);

  // 실시간 정보 필요: Perplexity (실시간 웹 검색)
  if (hasCurrentRequest) {
    return {
      complexity: 'realtime',
      recommendedModel: 'perplexity',
      reasoning: 'Real-time information needed - using Perplexity for web-search powered answers',
    };
  }

  // 전문가 수준 쿼리: o1 (수학, 과학, 복잡한 추론)
  if (hasMathRequest || (hasResearchRequest && wordCount > 30)) {
    return {
      complexity: 'expert',
      recommendedModel: 'o1',
      reasoning: 'Expert-level reasoning required - using OpenAI o1 for advanced problem solving',
    };
  }

  // 단순 쿼리: Gemini 2.5 Pro (빠르고 강력)
  if (wordCount < 10 && !hasMultipleQuestions && !hasCodeRequest) {
    return {
      complexity: 'simple',
      recommendedModel: 'gemini',
      reasoning: 'Simple question - using Gemini 2.5 Pro for fast and accurate responses',
    };
  }

  // 매우 복잡한 쿼리: Claude 3.5 Sonnet (깊이 있는 분석과 코딩)
  if (
    hasCodeRequest ||
    (hasAnalysisRequest && wordCount > 30) ||
    wordCount > 50 ||
    hasMultipleQuestions
  ) {
    return {
      complexity: 'complex',
      recommendedModel: 'claude',
      reasoning: 'Complex query requiring deep analysis or coding - using Claude 3.5 Sonnet',
    };
  }

  // 중간 복잡도: GPT-5 (균형잡힌 선택)
  return {
    complexity: 'moderate',
    recommendedModel: 'gpt4',
    reasoning: 'Moderate complexity - using GPT-5 for superior performance',
  };
}

// 비용 최적화를 위한 모델 선택
export function selectModelForBudget(
  complexity: 'simple' | 'moderate' | 'complex' | 'expert',
  budget: 'low' | 'medium' | 'high'
): 'gemini' | 'gpt4' | 'claude' | 'o1' | 'gemini-pro' {
  // 낮은 예산: 항상 Gemini
  if (budget === 'low') {
    return 'gemini';
  }

  // 중간 예산: 복잡도에 따라
  if (budget === 'medium') {
    return complexity === 'complex' ? 'gpt4' : 'gemini';
  }

  // 높은 예산: 최고 품질 모델 사용
  const modelMap: Record<typeof complexity, 'gemini' | 'gpt4' | 'claude' | 'o1'> = {
    simple: 'gemini',
    moderate: 'gpt4',
    complex: 'claude',
    expert: 'o1',
  };

  return modelMap[complexity];
}

// 모델 성능 통계
export interface ModelStats {
  model: string;
  avgResponseTime: number;
  avgTokensUsed: number;
  successRate: number;
  costPerQuery: number;
}

// 실시간 모델 성능 기반 라우팅 (Advanced)
export function selectModelByPerformance(
  stats: ModelStats[],
  priority: 'speed' | 'quality' | 'cost'
): string {
  switch (priority) {
    case 'speed':
      return stats.sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0]?.model || 'gemini';

    case 'quality':
      return stats.sort((a, b) => b.successRate - a.successRate)[0]?.model || 'claude';

    case 'cost':
      return stats.sort((a, b) => a.costPerQuery - b.costPerQuery)[0]?.model || 'gemini';

    default:
      return 'gpt4';
  }
}
