import { App, CloudContext } from "@multicloud/sls-core";
import { AzureModule, StorageQueueMiddleware } from "@multicloud/sls-azure";
import { RepositoryService } from "@paddleboard/core";

const middlewares = [StorageQueueMiddleware()];
const app = new App(new AzureModule());
app.registerMiddleware(...middlewares);

export const ingestRepository = app.use(async (context: CloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const repoService = new RepositoryService();
  const events: [] = context.event.records;

  await events.forEachAsync(async (event: any) => {
    const existing = await repoService.findSingle({ accountId: event.body.account.id, name: event.body.repository.name });
    if (!existing) {
      await repoService.save(event.body.repository);
    }
  });

  context.send(null, 204);
});
