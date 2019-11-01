import { DeveloperAccount } from "@paddleboard/contracts";

export interface GitHubInstallationEvent {
  installationId: number;
  account: DeveloperAccount;
}
