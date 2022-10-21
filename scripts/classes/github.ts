import { request } from "@octokit/request";

class GithubClient {
  private static instance: GithubClient;

  static getInstance() {
    if (!GithubClient.instance) {
      GithubClient.instance = new GithubClient();
    }
    return GithubClient.instance;
  }

  query(url: string) {
    return request({
      method: "GET",
      url,
      headers: {
        authorization: `token ${process.env.GH_CLIENT_PRIVATE_KEY!}`
      }
    });
  }
}

export default GithubClient.getInstance();
