require("@next/env").loadEnvConfig(process.cwd());
// WARNING: Anything you want to import do it after the loadEnvConfig(...) call to have .env file processed.
import { Endpoints } from "@octokit/types";
import { ArticleType } from "../types/models";
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
  const promises = [];
  if (Array.isArray(data)) {
    const languageService = LanguageService.getInstance();
    let doc_freq = new Map();

    for (const file of data) {
      if (file.name.search(/\d+/) !== -1) {
        const { data }: { data: BlobContentType } = await github.query(
          `${MEXICAN_CONSTITUTION_GITHUB_PATH}/git/blobs/${file.sha}`
        );
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        const [name, ...rest] = content.split("\n");
        const article_name = name.match(/[A-zÁ-ú0-9 ]+/g)?.pop();
        rest.shift();
        const article_content = rest.join("\n");
        const keywords = await languageService.getKeywords(article_content);
        const lemma_keywords = keywords!.map((k) => k.lemma) as string[];
        // array of unique keywords to add at most one per document
        const unique_keywords = new Set(lemma_keywords);
        unique_keywords.forEach((word) => {
          if (doc_freq.has(word)) {
            doc_freq.set(word, doc_freq.get(word) + 1);
          }
          doc_freq.set(word, 1);
        });
      }
    }
    for (const file of data) {
      if (file.name.search(/\d+/) !== -1) {
        const article: {
          codeName?: string;
          content?: string;
          name?: string;
          keywords?: string[];
          weights?: Map<string, number>;
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
        const lemma_keywords = keywords!.map((k) => k.lemma) as string[];
        article.keywords = lemma_keywords;
        // lemma_keywords = [a,b,b,poli,poli,poli,poli,poli,poli,poli,poli]
        // map keywords {a: 1, b: 2, rod: 0, poli: 8}
        // map term frequency in doc(tf) {a: 1/11, b: 2/11, rod: 0/11, poli: 8/11}
        // number of docs / number of docs with keywords in it(idf)
        //    {a: 10/3, b: 10/2, rod: 10/7, poli: 10/9} a appears in 3 out of 10 documents
        // tf[a] * (ln(idf[a]))
        // tfidf = {a: 1.2, b: 3.2, rod: 0, poli: .8}
        let term_freq = new Map();
        for (const word of lemma_keywords) {
          if (term_freq.has(word)) {
            term_freq.set(word, doc_freq.get(word) + 1 / lemma_keywords.length);
          }
          term_freq.set(word, 1 / lemma_keywords.length);
        }
        let tfidf = new Map();
        term_freq.forEach((value: number, key: string) => {
          tfidf.set(
            key,
            Math.log(data.content.split(" ").length / doc_freq.get(key)) *
              (value as number)
          );
        });
        article.weights = tfidf;
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
    }
  }
  Promise.all(promises)
    .then(() => {
      console.info("Finished uploading articles");
      process.exit();
    })
    .catch(ErrorManager.log);
})();
