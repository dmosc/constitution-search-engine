import { connect } from "mongoose";

connect(process.env.MONGO_URI!);

export { default as Article } from "./article";
export { default as User } from "./user";
