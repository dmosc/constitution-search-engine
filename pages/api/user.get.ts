import { User } from "models";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const user = await User.findOne({ email: session?.user.email }).populate(
    "starredArticles"
  );
  res.status(200).send(user);
}
