import { PaddleboardCloudContext } from "../models/paddleboardCloudContext";
import { Middleware } from "@multicloud/sls-core";
import { PullRequestValidationMiddleware } from "./pullRequestValidationMiddleware";
import { CodeReviewService } from "../services/codeReviewService";

const pullRequestValidation = PullRequestValidationMiddleware();

export const CodeReviewValidationMiddleware = (): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  await pullRequestValidation(context, () => Promise.resolve());

  if (!context.pullRequest) {
    return;
  }

  if (!context.req.pathParams.has("codeReviewId")) {
    return context.send({ message: "codeReviewId is required" }, 400);
  }

  const codeReviewId = context.req.pathParams.get("codeReviewId");
  const codeReviewService = new CodeReviewService();
  const codeReview = await codeReviewService.get(codeReviewId, context.pullRequest.id);

  if (!codeReview) {
    return context.send({ message: "code review not found" }, 404);
  }

  context.codeReview = codeReview;

  await next();
};
