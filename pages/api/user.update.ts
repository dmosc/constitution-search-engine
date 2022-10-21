import { User } from "models";
import { Types } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

type ReqBodyType = {
  starredArticles: Types.ObjectId[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBody = JSON.parse(req.body) as ReqBodyType;
  const session = await getSession({ req });
  const user = await User.findOneAndUpdate(
    { email: session?.user.email },
    { $set: { starredArticles: reqBody.starredArticles } },
    { new: true }
  ).populate("starredArticles");
  res.status(200).send(user);
}
