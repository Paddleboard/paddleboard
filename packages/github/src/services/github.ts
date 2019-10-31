import jwt from "jsonwebtoken";
import axios from "axios";

export interface GitHubServiceOptions {
  appId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  signingKey: string;
  ttl?: number;
};

/**
 * Manages GitHub integration workflows
 */
export class GitHubService {
  private jwtToken: string;

  public constructor(private options: GitHubServiceOptions) {
    this.jwtToken = this.createAppToken();
    axios.defaults.headers = {
      "authorization": `bearer ${this.jwtToken}`,
      "accept": "application/vnd.github.machine-man-preview+json"
    };
  }

  /**
   * Creates a JWT app token for the Paddleboard application
   */
  public createAppToken() {
    const signingKey = Buffer.from(this.options.signingKey);
    const expires = this.options.ttl || 60 * 10;

    return jwt.sign({}, signingKey, { algorithm: "RS256", issuer: this.options.appId, expiresIn: expires });
  }

  /**
   * Creates a user access token to perform actions on behalf of a github user account
   * @param code The short-lived token from an ouath response
   */
  public async getUserAccessToken(code: string): Promise<string> {
    const response = await axios.post("https://github.com/login/oauth/access_token", {
      code: code,
      client_id: process.env.GITHUB_CLIENT_ID, // eslint-disable-line
      client_secret: process.env.GITHUB_CLIENT_SECRET, // eslint-disable-line
      redirect_uri: process.env.GITHUB_REDIRECT_URI, // eslint-disable-line
    }, {
      headers: {
        "accept": "application/json"
      }
    });

    return response.data.access_token;
  }

  /**
   * Gets a user account details
   * @param userAccessToken A user access token
   */
  public async getUserAccount(userAccessToken: string): Promise<any> {
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        "authorization": `token ${userAccessToken}`,
        "accept": "application/json"
      }
    });

    return userResponse.data;
  }

  /**
   * Gets installations of paddleboard github app
   */
  public async getInstallations(): Promise<any[]> {
    const installationsResponse = await axios.get("https://api.github.com/app/installations");
    return installationsResponse.data;
  }

  /**
   * Gets a paddleboard installation by id
   * @param installationId The paddleboard github app installation id
   */
  public async getInstallation(installationId: string): Promise<any> {
    const installationsResponse = await axios.get(`https://api.github.com/app/installations/${installationId}`);
    return installationsResponse.data;
  }

  /**
   * Gets the repositories accessible by the paddleboard app for the specified installation id
   * @param installationId The paddleboard github app installation id
   */
  public async getRepositories(installationId: string): Promise<any[]> {
    const tokenResponse = await this.createInstallationAccessToken(installationId);
    const reposResponse = await axios.get("https://api.github.com/installation/repositories", {
      headers: {
        "authorization": `token ${tokenResponse.token}`
      }
    });

    return reposResponse.data.repositories;
  }

  /**
   * Creates a short lived access token to be used in making requests on behalf of a specifed installation id
   * @param installationId The paddleboard app installation id
   */
  private async createInstallationAccessToken(installationId: string): Promise<any> {
    const tokensResponse = await axios.post(`https://api.github.com/app/installations/${installationId}/access_tokens`);
    return tokensResponse.data;
  }
}
