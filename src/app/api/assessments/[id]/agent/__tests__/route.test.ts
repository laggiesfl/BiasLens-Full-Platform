import { describe, expect, it } from "vitest";
import { createAgentPostHandler } from "../route";

function request(body: string) {
  return new Request("https://biaslens.test/api/assessments/a1/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

const baseDeps = {
  getAuthenticatedUser: async () => ({ id: "user-1" }),
  getAccessibleAssessment: async () => ({
    id: "a1",
    role_context: "business" as const,
  }),
  recordResponse: async () => ({ system_name: "ScreenRight" }),
  recordPosture: async () => undefined,
  loadContext: async () => ({ answers: { system_name: "ScreenRight" } }),
  saveMessage: async () => undefined,
  runTurn: async () => ({
    type: "question" as const,
    message: "Who owns or provides the system?",
    question: {
      id: "provider",
      stepId: "basics",
      stepTitle: "System basics",
      label: "Who owns or provides the system?",
      type: "text" as const,
      required: false,
    },
    evidenceStates: [],
  }),
};

describe("BiasLens authenticated agent API", () => {
  it("returns 401 when there is no authenticated user", async () => {
    const handler = createAgentPostHandler({
      ...baseDeps,
      getAuthenticatedUser: async () => null,
    });
    const response = await handler(request(JSON.stringify({ message: "hello" })), {
      params: Promise.resolve({ id: "a1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const handler = createAgentPostHandler(baseDeps);
    const response = await handler(request("{"), {
      params: Promise.resolve({ id: "a1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when RLS exposes no assessment", async () => {
    const handler = createAgentPostHandler({
      ...baseDeps,
      getAccessibleAssessment: async () => null,
    });
    const response = await handler(request(JSON.stringify({ message: "hello" })), {
      params: Promise.resolve({ id: "a1" }),
    });
    expect(response.status).toBe(404);
  });

  it("records a valid answer and returns the next permitted turn", async () => {
    const handler = createAgentPostHandler(baseDeps);
    const response = await handler(
      request(JSON.stringify({ questionId: "system_name", answer: "ScreenRight" })),
      { params: Promise.resolve({ id: "a1" }) }
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.type).toBe("question");
    expect(data.question.id).toBe("provider");
  });

  it("does not echo sensitive submitted text in server errors", async () => {
    const handler = createAgentPostHandler({
      ...baseDeps,
      recordResponse: async () => {
        throw new Error("database rejected SECRET APPLICANT DATA");
      },
    });
    const response = await handler(
      request(
        JSON.stringify({
          questionId: "system_name",
          answer: "SECRET APPLICANT DATA",
        })
      ),
      { params: Promise.resolve({ id: "a1" }) }
    );
    const text = await response.text();
    expect(response.status).toBe(500);
    expect(text).not.toContain("SECRET APPLICANT DATA");
  });
});
