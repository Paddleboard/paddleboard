import { CloudContext, CloudMessage } from "@multicloud/sls-core";
import { UserProfile } from "./app";

export interface PaddleboardCloudContext extends CloudContext {
  user: UserProfile;
  identity?: PaddleboardIdentity;
  event: PaddleboardEventCollection;
  [key: string]: any;
}

export interface PaddleboardEventCollection {
  records: PaddleboardEvent[];
}

export interface PaddleboardEvent<T = any> extends CloudMessage {
  body: T;
};

export interface PaddleboardIdentity {
  issuer: string;
  audience: string;
  subject: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: string;
  scopes: string[];
  claims: { [key: string]: any };
}
