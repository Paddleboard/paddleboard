import { PaddleboardCloudContext } from "@paddleboard/contracts";
import jsonwebtoken from "jsonwebtoken";
import { Middleware } from "@multicloud/sls-core";

export interface JwtMiddlewareOptions {
  required: boolean;
}

export const JwtMiddleware = (options?: JwtMiddlewareOptions): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  options = options || {
    required: false
  };

  const authHeader = context.req.headers.get("authorization") as string;
  let decodedToken: any = "";

  if (authHeader) {
    const authHeaderParts = authHeader.split(" ");
    if (authHeaderParts.length !== 2) {
      return context.send({ message: "Authorization token is invalid." }, 401);
    };

    decodedToken = jsonwebtoken.decode(authHeaderParts[1]);
  } else {
    if (options.required) {
      return context.send({ message: "Authorization token is missing or invalid." }, 401);
    }
  }

  if (decodedToken) {
    context.identity = {
      firstName: decodedToken.given_name,
      lastName: decodedToken.family_name,
      email: decodedToken.emails ? decodedToken.emails[0] : "",
      subject: decodedToken.sub,
      provider: decodedToken.idp,
      issuer: decodedToken.iss,
      audience: decodedToken.aud,
      scopes: (decodedToken.scp || "").split(" "),
      claims: {
        ...decodedToken
      },
    }
  }

  await next();
};
