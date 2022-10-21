import { Schema, model, Types } from "mongoose";
import { UserType } from "types/models";

const User = new Schema<UserType>({
  email: { type: String, required: true, unique: true },
  starredArticles: [{ type: Types.ObjectId, required: true, ref: "Article" }]
});

export default model<UserType>("User", User, undefined, {
  overwriteModels: true
});
