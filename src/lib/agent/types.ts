import type { QuestionType } from "@/lib/questionnaire";

export interface AgentQuestionOption {
  value: string;
  label: string;
}

export interface AgentQuestion {
  id: string;
  stepId: string;
  stepTitle: string;
  label: string;
  type: QuestionType;
  help?: string;
  options?: AgentQuestionOption[];
  required: boolean;
}

export interface AssessmentQuestionState {
  visibleQuestions: AgentQuestion[];
  answeredQuestionIds: string[];
  unansweredQuestionIds: string[];
}
