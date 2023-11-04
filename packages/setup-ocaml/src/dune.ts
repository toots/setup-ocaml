import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

import { GITHUB_TOKEN } from "./constants";

const {
  repo: { owner, repo },
  runId: run_id,
} = github.context;

export async function installDune() {
  await core.group("Install dune", async () => {
    await exec("opam", ["depext", "--install", "dune"]);
  });
}

export async function trimDuneCache() {
  await core.group(
    "Remove oldest files from the dune cache to free space",
    async () => {
      const octokit = github.getOctokit(GITHUB_TOKEN);
      const {
        data: { total_count: totalCount },
      } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id,
      });
      const cacheSize = Math.floor(5000 / totalCount);
      await exec("opam", [
        "exec",
        "--",
        "dune",
        "cache",
        "trim",
        "--size",
        `${cacheSize}MB`,
      ]);
    },
  );
}
