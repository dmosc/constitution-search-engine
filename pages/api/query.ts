import { Article, User } from "models";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import LanguageService from "services/language-service";

type ReqQueryType = {
  q: string;
  starred: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q = "", starred } = req.query as unknown as ReqQueryType;
  const languageService = LanguageService.getInstance();
  const keywords = await languageService.getKeywords(q as string);
  const synonyms = [];
  for (const keyword of keywords) {
    const newSynonyms = await languageService.getSynonyms(keyword.lemma!);
    synonyms.push(...newSynonyms);
  }
  const filters: { [key: string]: any } = {};
  const matchedWords = [
    ...keywords.map((k) => k.lemma!),
    ...synonyms.map((s) => s)
  ];
  if (!!q) {
    matchedWords.push(...q.split(" "));
  }
  if (matchedWords.length) {
    filters.keywords = { $elemMatch: { $in: matchedWords } };
  }
  if (!!starred) {
    const session = await getSession({ req });
    const user = await User.findOne({ email: session?.user.email });
    filters._id = { $in: user?.starredArticles };
  }
  const articles = await Article.aggregate([
    { $match: filters },
    {
      $addFields: {
        tfidf: {
          $reduce: {
            input: { $objectToArray: "$$ROOT.weights" },
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                { $cond: [{ $in: ["$$this.k", "$keywords"] }, "$$this.v", 0] }
              ]
            }
          }
        }
      }
    },
    { $sort: { tfidf: -1 } }
  ]);
  res.status(200).json({ articles, matchedWords });
}
