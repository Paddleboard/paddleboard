import { app, CodeReviewApiContext } from "../app";
import { CodeReviewService, CodeReviewValidationMiddleware, PullRequestValidationMiddleware } from "@paddleboard/core";

const pullRequestValidation = PullRequestValidationMiddleware();
const codeReviewValidation = CodeReviewValidationMiddleware();

export const getCodeReviewListByUser = app.use(async (context: CodeReviewApiContext) => {
  const codeReviewService = new CodeReviewService();
  const reviews = await codeReviewService.getByUser(context.user.id);

  return { value: reviews };
});

export const getCodeReviewListByPullRequest = app.use([pullRequestValidation], async (context: CodeReviewApiContext) => {
  const codeReviewService = new CodeReviewService();
  const reviews = await codeReviewService.getByPullRequest(context.pullRequest.id);

  return { value: reviews };
});

export const getCodeReview = app.use([codeReviewValidation], (context: CodeReviewApiContext) => {
  return { value: context.codeReview };
});
