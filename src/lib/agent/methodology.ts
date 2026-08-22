import { QUESTIONNAIRE, type Answers } from "@/lib/questionnaire";
import type { Role } from "@/lib/roles";
import type { AgentQuestion, AssessmentQuestionState } from "./types";

function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function getAssessmentQuestionState(
  role: Role,
  answers: Answers
): AssessmentQuestionState {
  const visibleQuestions: AgentQuestion[] = [];

  for (const step of QUESTIONNAIRE) {
    for (const question of step.questions) {
      if (question.visibleIf && !question.visibleIf(role, answers)) continue;

      visibleQuestions.push({
        id: question.id,
        stepId: step.id,
        stepTitle: step.title,
        label: question.label,
        type: question.type,
        help: question.help,
        options: question.options,
        required: question.required ?? false,
      });
    }
  }

  const answeredQuestionIds = visibleQuestions
    .filter((question) => isAnswered(answers[question.id]))
    .map((question) => question.id);

  const answered = new Set(answeredQuestionIds);
  const unansweredQuestionIds = visibleQuestions
    .filter((question) => !answered.has(question.id))
    .map((question) => question.id);

  return {
    visibleQuestions,
    answeredQuestionIds,
    unansweredQuestionIds,
  };
}

export function getNextQuestion(
  role: Role,
  answers: Answers
): AgentQuestion | null {
  const state = getAssessmentQuestionState(role, answers);
  const nextId = state.unansweredQuestionIds[0];
  if (!nextId) return null;
  return state.visibleQuestions.find((question) => question.id === nextId) ?? null;
}
