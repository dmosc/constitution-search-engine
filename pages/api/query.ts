import { Article } from "models";
import type { NextApiRequest, NextApiResponse } from "next";
import LanguageService from "services/language-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q = "" } = req.query;
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
  if (matchedWords.length) {
    filters.keywords = { $elemMatch: { $in: matchedWords } };
  }
  const articles = await Article.find(filters).limit(20);
  res.status(200).json({ articles, matchedWords });
}
