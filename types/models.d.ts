import { Types } from "mongoose";

type ArticleType = {
  _id: Types.ObjectId;
  codeName: string;
  name: string;
  content: string;
  weights: Map<string, number>;
  keywords: string[];
  views: number;
};

type UserType = {
  _id: Types.ObjectId;
  email: string;
  starredArticles: ArticleType[];
};
