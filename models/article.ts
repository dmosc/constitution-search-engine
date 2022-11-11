import { Schema, model } from "mongoose";
import { ArticleType } from "types/models";

const Article = new Schema<ArticleType>({
  codeName: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  weights: { type: Map, of: Number, required: true },
  keywords: [{ type: String, required: true }],
  views: { type: Number, required: true },
});

export default model<ArticleType>("Article", Article, undefined, {
  overwriteModels: true
});