import { app, CategoryApiContext } from "../app";
import { CategoryService, CategoryValidationMiddleware } from "@paddleboard/core";

const categoryValidation = CategoryValidationMiddleware();

export const getCategoryListByUser = app.use(async (context: CategoryApiContext) => {
  const categoryService = new CategoryService();
  const categories = await categoryService.getByUser(context.user.id);

  context.send({ value: categories }, 200);
});

export const getCategory = app.use([categoryValidation], (context: CategoryApiContext) => {
  context.send({ value: context.category }, 200);
});

export const postCategory = app.use(async (context: CategoryApiContext) => {
  if (!context.req.body) {
    return context.send({ message: "category is required" }, 400);
  }

  const categoryService = new CategoryService();
  const category = await categoryService.save(context.req.body, context.user.id);
  const newUri = `categories/${category.id}`;

  context.res.headers.set("location", newUri);
  context.send({ value: category }, 201);
});

export const putCategory = app.use([categoryValidation], async (context: CategoryApiContext) => {
  const categoryToSave = {
    ...context.req.body,
    id: context.category.id
  };

  const categoryService = new CategoryService();
  await categoryService.save(categoryToSave, context.user.id);

  context.send(null, 204);
});

export const patchCategory = app.use([categoryValidation], async (context: CategoryApiContext) => {
  const categoryToSave = {
    ...context.category,
    ...context.req.body,
    id: context.category.id
  };

  const categoryService = new CategoryService();
  await categoryService.save(categoryToSave, context.user.id);

  context.send([], 204);
});

export const deleteCategory = app.use([categoryValidation], async (context: CategoryApiContext) => {
  const categoryService = new CategoryService();
  await categoryService.delete(context.category, context.user.id);

  context.send(null, 204);
});
