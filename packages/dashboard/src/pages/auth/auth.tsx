import React from "react";
import axios from "axios";
import { UserManager } from "oidc-client";

export class Auth extends React.Component {
  public async componentDidMount() {
    const userManager = new UserManager({
      loadUserInfo: false,
      client_id: "ffce8ced-3cb0-411e-ba2b-2a6c4cf36470",
      prompt: "login",
      authority: "https://paddleboard.b2clogin.com/paddleboard.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_signup_signin",
      redirect_uri: `${window.location.origin}/auth/openid`,
      response_type: "id_token token",
      scope: "openid https://paddleboard.onmicrosoft.com/api/user.read.all"
    });

    const user = await userManager.signinRedirectCallback();
    axios.defaults.headers = {
      authorization: `${user.token_type} ${user.access_token}`
    };

    try {
      const usersResponse = await axios.get("https://paddleboard.breza.io/api/users");
      const reposResponse = await axios.get(`https://paddleboard.breza.io/api/users/${usersResponse.data.value[0].id}/repositories`);

      console.log(user);
      console.log(usersResponse.data);
      console.log(reposResponse.data);
    }
    catch (e) {
      console.log(e);
    }
  }

  public render() {
    return null;
  }
}
