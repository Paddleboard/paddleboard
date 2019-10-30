import { CategoryService } from "../services/categoryService";
import { UserProfileValidationMiddleware } from "./userProfileValidationMiddleware";
import { PaddleboardCloudContext } from "../models/paddleboardCloudContext";
import { Middleware } from "@multicloud/sls-core";

const userProfileValidation = UserProfileValidationMiddleware();

export const CategoryValidationMiddleware = (): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  await userProfileValidation(context, () => Promise.resolve());

  if (!context.user) {
    return;
  }

  if (!context.req.pathParams.has("categoryId")) {
    return context.send({ message: "categoryId is required" }, 400);
  }

  const categoryId = context.req.pathParams.get("categoryId");
  const categoryService = new CategoryService();
  const category = await categoryService.get(categoryId, context.user.id);

  if (!category) {
    return context.send({ message: "categoryId not found" }, 404);
  }

  context.category = category;

  await next();
};
