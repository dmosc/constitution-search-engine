import { User } from "models";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

type ReqQuery = {
  articleId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqQuery = req.query as ReqQuery;
  const session = await getSession({ req });
  User.findOneAndUpdate(
    { email: session?.user.email },
    { $addToSet: { starredArticles: reqQuery.articleId } }
  );
  res.status(200).send("ok");
}
