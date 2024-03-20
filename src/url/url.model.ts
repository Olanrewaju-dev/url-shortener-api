import { Schema, model } from "mongoose";

// Define the URL interface
interface IUrl extends Document {
  urlId: string;
  origUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  owner?: Schema.Types.ObjectId;
}

// Define the URL schema
const UrlSchema = new Schema<IUrl>({
  shortUrl: { type: String, required: true },
  urlId: { type: String, required: true },
  origUrl: { type: String, required: true },
  clicks: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

// Create and export the URL model
export const UrlModel = model<IUrl>("Url", UrlSchema);
