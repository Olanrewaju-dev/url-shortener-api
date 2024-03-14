import { Schema, model } from "mongoose";
import * as bcrypt from "bcrypt";

// Creating an interface representing a document in MongoDB.
interface IUser extends Document {
  id?: Schema.Types.ObjectId;
  username: String;
  email: String;
  password: String;
  isValidPassword(password: string): Promise<boolean>;
}

// Creating a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  id: { type: Schema.Types.ObjectId },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// before save
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password.toString(), salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password: string) {
  const user = this;
  const compare = await bcrypt.compare(password, this.password);
  return compare;
};

// Creating and exporting the user Model to be used in user controllers.
export const UserModel = model<IUser>("User", userSchema);
