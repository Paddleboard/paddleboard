import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { GitHubService, GitHubServiceOptions } from "./github";

describe("Github Service", () => {
  let githubService: GitHubService;
  const mock = new MockAdapter(axios);

  beforeAll(() => {
    const options: GitHubServiceOptions = {
      appId: process.env.GITHUB_APP_ID,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      signingKey: process.env.GITHUB_SIGNING_KEY,
      redirectUri: process.env.GITHUB_REDIRECT_URI,
    };
    githubService = new GitHubService(options)

    mock.onGet("https://api.github.com/app/installations").reply(200, [{ id: "abc123" }]);
    mock.onGet("https://api.github.com/app/installations/abc123").reply(200, { id: "abc123" });
    mock.onPost("https://api.github.com/app/installations/abc123/access_tokens").reply(200, { token: "XYZ789" });
    mock.onGet("https://api.github.com/installation/repositories").reply(200, { repositories: [{ id: "r1" }] });

  });

  it("Can generate a github JWT token", () => {
    const jwt = githubService.createAppToken();

    expect(jwt).not.toBeNull();
  });

  it("Can get a list of app installations", async () => {
    const installations = await githubService.getInstallations();
    expect(installations.length).toBeGreaterThan(0);
  });

  it("Can get a app installation", async () => {
    const installations = await githubService.getInstallations();
    const installation = await githubService.getInstallation(installations[0].id);

    expect(installation).toEqual(installations[0]);
  });

  it("Can retrieve installation repositories", async () => {
    const installations = await githubService.getInstallations();
    const installation = await githubService.getInstallation(installations[0].id);
    const repos = await githubService.getRepositories(installation.id);

    expect(repos.length).toBeGreaterThan(0);
  });
});
