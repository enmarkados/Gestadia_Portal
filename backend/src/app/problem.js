export class AppProblem extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
export function problem(res, error, correlationId) {
  const status = error instanceof AppProblem ? error.status : 503;
  const code = error instanceof AppProblem ? error.code : "runtime_unavailable";
  return res
    .status(status)
    .type("application/problem+json")
    .json({
      type: `urn:gestadia:app:problem:${code}`,
      title: code,
      status,
      code,
      detail: "No se pudo completar la operación.",
      correlation_id: correlationId,
      retryable: status === 429 || status === 503,
    });
}
