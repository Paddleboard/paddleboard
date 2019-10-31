import { CloudContext } from "@multicloud/sls-core";
import { UserProfile } from "./app";

export interface PaddleboardCloudContext extends CloudContext {
  user: UserProfile;
  identity?: PaddleboardIdentity;
  [key: string]: any;
}


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
