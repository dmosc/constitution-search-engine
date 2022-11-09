require("@next/env").loadEnvConfig(process.cwd());
// WARNING: Anything you want to import do it after the loadEnvConfig(...) call to have .env file processed.
import { Endpoints } from "@octokit/types";
import { Article } from "../models";
import LanguageService from "../services/language-service";
import ErrorManager from "../utils/error-manager";
import github from "./classes/github";

/*
  Using https://github.com/ceyusa/constitucion-mexicana project as data source.
  The repository contains the Mexican Constitution articles split in multiple files.
*/
const MEXICAN_CONSTITUTION_GITHUB_PATH = "/repos/ceyusa/constitucion-mexicana";

type ResourcesType =
  Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"];
type BlobContentType =
  Endpoints["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"]["response"]["data"];

(async () => {
  console.info("Processing constitution...");
  const { data }: { data: ResourcesType } = await github.query(
    `${MEXICAN_CONSTITUTION_GITHUB_PATH}/contents/CPEUM`
  );
  if (Array.isArray(data)) {
    const languageService = LanguageService.getInstance();
    const articles = [];
    const globalWordFrequencies = new Map();

    for (const file of data) {
      if (file.name.search(/\d+/) !== -1) {
        const article: {
          codeName?: string;
          content?: string;
          name?: string;
          keywords?: string[];
          weights?: { [key: string]: number };
          _wordFrequencies?: Map<string, number>;
        } = {
          codeName: file.name.split(".")[0]
        };
        const { data }: { data: BlobContentType } = await github.query(
          `${MEXICAN_CONSTITUTION_GITHUB_PATH}/git/blobs/${file.sha}`
        );
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        const [name, ...rest] = content.split("\n");
        article.name = name.match(/[A-zÁ-ú0-9 ]+/g)?.pop();
        rest.shift();
        article.content = rest.join("\n");
        const keywords = await languageService.getKeywords(article.content!);
        const lemmaKeywords = keywords!.map((k) => k.lemma) as string[];
        article.keywords = lemmaKeywords;
        const wordFrequencies = article.keywords.reduce((freqs, keyword) => {
          const prevCount = freqs.get(keyword) ?? 0;
          freqs.set(keyword, prevCount + 1);
          return freqs;
        }, new Map());
        wordFrequencies.forEach((value, key) => {
          wordFrequencies.set(key, value / (article.keywords?.length ?? 1));
          const prevGlobalCount = globalWordFrequencies.get(key) ?? 0;
          globalWordFrequencies.set(key, prevGlobalCount + 1);
        });
        article._wordFrequencies = wordFrequencies;
        articles.push(article);
      }
    }

    globalWordFrequencies.forEach((value, key) => {
      globalWordFrequencies.set(key, articles?.length / value);
    });

    const promises = [];
    for (const article of articles) {
      article.weights = {};
      article._wordFrequencies!.forEach((value, key) => {
        article.weights![key] =
          value * Math.log(globalWordFrequencies.get(key));
      });
      delete article._wordFrequencies;
      promises.push(
        Article.updateOne(
          { codeName: article.codeName },
          {
            $set: article
          },
          { upsert: true }
        )
      );
      console.info(`Uploaded/updated ${article.codeName}.`);
    }

    Promise.all(promises)
      .then(() => {
        console.info("Finished uploading articles");
        process.exit();
      })
      .catch(ErrorManager.log);
  }
})();
