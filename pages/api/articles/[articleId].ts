import {Article} from "models";
import type {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {articleId} = req.query;
  const article = await Article.findOne({_id: articleId})
  res.status(200).send(article);
}
