import jwt from "jsonwebtoken";
import axios from "axios";
import Octokit, { AppsListInstallationsResponseItem, AppsGetInstallationResponse, AppsCreateInstallationTokenResponse, UsersGetAuthenticatedResponse, AppsListReposResponseRepositoriesItem } from "@octokit/rest";

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
  private client: Octokit;

  public constructor(private options: GitHubServiceOptions) {
    this.jwtToken = this.createAppToken();
    this.client = new Octokit({ auth: this.jwtToken });
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
  public async getUserAccount(userAccessToken: string): Promise<UsersGetAuthenticatedResponse> {
    const userClient = new Octokit({ auth: userAccessToken });
    const response = await userClient.users.getAuthenticated();

    return response.data;
  }

  /**
   * Gets installations of paddleboard github app
   */
  public async getInstallations(): Promise<AppsListInstallationsResponseItem[]> {

    const response = await this.client.apps.listInstallations();
    return response.data;
  }

  /**
   * Gets a paddleboard installation by id
   * @param installationId The paddleboard github app installation id
   */
  public async getInstallation(installationId: number): Promise<AppsGetInstallationResponse> {
    const response = await this.client.apps.getInstallation({ installation_id: installationId }); // eslint-disable-line
    return response.data;
  }

  /**
   * Gets the repositories accessible by the paddleboard app for the specified installation id
   * @param installationId The paddleboard github app installation id
   */
  public async getRepositories(installationId: number): Promise<AppsListReposResponseRepositoriesItem[]> {
    const accessToken = await this.createInstallationAccessToken(installationId);

    const installationClient = new Octokit({ auth: accessToken.token });
    const response = await installationClient.apps.listRepos();

    return response.data.repositories;
  }

  /**
   * Creates a short lived access token to be used in making requests on behalf of a specifed installation id
   * @param installationId The paddleboard app installation id
   */
  private async createInstallationAccessToken(installationId: number): Promise<AppsCreateInstallationTokenResponse> {
    const response = await this.client.apps.createInstallationToken({ installation_id: installationId });  // eslint-disable-line
    return response.data;
  }
}
