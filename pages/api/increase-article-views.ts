import { Article } from "models";
import type { NextApiRequest, NextApiResponse } from "next";
import { Types, ObjectId } from "mongoose";
import mongoose from "mongoose";

type ReqBodyType = {
  articleId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Increase");
  const reqBody = JSON.parse(req.body) as ReqBodyType;
  console.log(reqBody.articleId);
  Article.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(reqBody.articleId) },
    { $inc: { views: 1 } },
    { new: true },
    function (err, docs) {
      if (err) {
        console.log(err);
      }
    }
  );
  res.status(200).send("ok");
}
