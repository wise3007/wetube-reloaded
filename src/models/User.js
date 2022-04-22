import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  console.log("유저가 만든 패스워드", this.password);
  // 여기서 말하는 this.password는 userController에 있는 User.create의 password를 말함
  this.password = await bcrypt.hash(this.password, 5);
  // 5는 saltOrRounds를 말함 5번 해시를 더 해준다는 거임
  console.log("해싱된 패스워드", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
