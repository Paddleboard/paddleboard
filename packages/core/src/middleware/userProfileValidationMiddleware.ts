import { UserProfileService } from "../services/userProfileService";
import { PaddleboardCloudContext } from "../models/paddleboardCloudContext";
import { Middleware } from "@multicloud/sls-core";

export const UserProfileValidationMiddleware = (): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  // If the user has already been set then short curcuit
  if (context.user) {
    return await next();
  }

  if (!context.req.pathParams.has("userId")) {
    return context.send({ message: "userId is required" }, 400);
  }

  const userId = context.req.pathParams.get("userId");
  const userProfileService = new UserProfileService();
  const user = await userProfileService.get(userId);

  if (!user) {
    return context.send({ message: "user not found" }, 404);
  }

  context.user = user;

  await next();
};
