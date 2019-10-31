export interface Entity {
  id?: string;
  audit?: AuditInfo;
}

export interface AuditInfo {
  created: Date;
  updated: Date;
}

export interface Category extends Entity {
  name: string;
  description?: string;
}

export interface Repository extends Entity {
  name: string;
  portalUrl: string;
  providerType: DeveloperAccountType;
  description?: string;
  categoryId?: string;
}

export interface PullRequest extends Entity {
  repositoryId: string;
  name: string;
  description?: string;
  portalUrl: string;
  state: PullRequestState;
}

export interface CodeReview extends Entity {
  userId: string;
  pullRequestId: string;
  state: CodeReviewState;
}

export interface UserProfile extends Entity {
  email: string;
  firstName: string;
  lastName: string;
  identity: Identity;
  accounts?: DeveloperAccount[];
  categories?: Category[];
  repositories?: Repository[];
}

export interface Identity {
  type: string;
  externalId: string;
  metadata?: any;
}

export interface DeveloperAccount extends Entity {
  providerType: DeveloperAccountType;
  providerId: string;
  metadata?: any;
}

export enum CodeReviewState {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Waiting = "waiting"
}

export enum PullRequestState {
  Active = "active",
  Merged = "merged",
  Closed = "closed"
}

export enum DeveloperAccountType {
  GitHub = "github",
  Azure = "azdo",
  GitLab = "gitlab",
  BitBucket = "bitbucket"
};
