import { PaddleboardCloudContext } from "@paddleboard/contracts";
import { UserProfileService } from "../services/userProfileService";
import { Middleware } from "@multicloud/sls-core";

export const CurrentUserMiddleware = (): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  if (context.identity) {
    const userService = new UserProfileService();
    context.user = await userService.getByEmail(context.identity.email);
  }

  await next();
};
