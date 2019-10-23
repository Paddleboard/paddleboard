import { app } from "../app";
import { PaddleboardCloudContext, UserProfileService, UserProfileValidationMiddleware, AccountService, UserProfile } from "@paddleboard/core";

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

  const accountService = new AccountService();

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
  const accountService = new AccountService();

  let account = await accountService.getByProvider(context.identity.subject, context.identity.provider);
  let user = await userService.getByEmail(context.identity.email);

  if (account && user && account.userId !== user.id) {
    return context.send({ message: "Account is already associated with another account" }, 409);
  }

  if (!user) {
    user = await userService.save({
      email: context.identity.email,
      firstName: context.identity.firstName,
      lastName: context.identity.lastName,
    });
  }

  user.accounts = await accountService.getByUser(user.id);

  if (!account) {
    account = {
      providerId: context.identity.subject,
      providerType: context.identity.provider,
      userId: user.id,
      metadata: context.identity
    };

    account = await accountService.save(account);
    user.accounts.push(account);
  }

  return {
    body: { value: user },
    headers: {
      "location": "https://paddleboard.breza.io/api/user"
    }
  };
});
