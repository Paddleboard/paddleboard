import { app } from "../app";
import { UserProfileService, UserProfileValidationMiddleware, DeveloperAccountService } from "@paddleboard/core";
import { PaddleboardCloudContext, UserProfile } from "@paddleboard/contracts"

const userValidation = UserProfileValidationMiddleware();

export const getUserProfileList = app.use(async () => {
  const userService = new UserProfileService();
  const users = await userService.list();

  return { value: users };
});

export const getUserProfile = app.use([userValidation], (context: PaddleboardCloudContext) => {
  return { value: context.user };
});

export const postUserProfile = app.use(async (context: PaddleboardCloudContext) => {
  if (!context.req.body) {
    return context.send({ message: "user profile is required" }, 400);
  }

  const userService = new UserProfileService();
  const user = await userService.save(context.req.body);
  const newUri = `users/${user.id}`;

  return {
    body: { value: user },
    status: 201,
    headers: {
      "location": newUri
    }
  };
});

export const putUserProfile = app.use([userValidation], async (context: PaddleboardCloudContext) => {
  const userToSave = {
    ...context.req.body,
    id: context.user.id
  };

  const userService = new UserProfileService();
  await userService.save(userToSave);

  return {
    body: null,
    status: 204
  };
});

export const patchUserProfile = app.use([userValidation], async (context: PaddleboardCloudContext) => {
  const userToSave = {
    ...context.user,
    ...context.req.body,
    id: context.user.id
  };

  const userService = new UserProfileService();
  await userService.save(userToSave);

  return {
    body: null,
    status: 204
  };
});

export const deleteUserProfile = app.use([userValidation], async (context: PaddleboardCloudContext) => {
  const userService = new UserProfileService();
  await userService.delete(context.user.id);

  return {
    body: null,
    status: 204
  };
});

export const getCurrentUserProfile = app.use(async (context: PaddleboardCloudContext) => {
  if (!context.user) {
    return context.send({ message: "User not found" }, 404);
  }

  const accountService = new DeveloperAccountService();

  const user: UserProfile = {
    ...context.user,
    accounts: await accountService.getByUser(context.user.id)
  };

  return {
    value: user
  };
});

export const postCurrentUserProfile = app.use(async (context: PaddleboardCloudContext) => {
  const userService = new UserProfileService();
  let user = await userService.getByEmail(context.identity.email);

  if (!user) {
    user = await userService.save({
      identity: {
        type: context.identity.claims.idp,
        externalId: context.identity.subject,
        metadata: context.identity.claims
      },
      email: context.identity.email,
      firstName: context.identity.firstName,
      lastName: context.identity.lastName,
    });
  }

  return {
    body: { value: user },
    headers: {
      "location": "https://paddleboard.breza.io/api/user"
    }
  };
});
