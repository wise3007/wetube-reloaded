import mongoose from "mongoose";

// findByIdAndUpdate() 는 훅이 없어서 middleware을 쓸수가 없다.
// 1번 방법 함수로 만들기
// 아래 함수처럼 해시태그를 만들어서 쓰고싶은 곳에 뿌리는 것도 하나의 방법임(나쁘지 않은 방법)
// export const formatHashtags = (hashtags) =>
//   hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

// findByIdAndUpdate() 는 훅이 없어서 middleware을 쓸수가 없다.
// 2번 방법 staticfunction을 만들기
// 아래 코드는 static 이란걸 이용해서 만든 middleware임 videoController에서 여기서 export 한 Video를 가져다 쓰기 때문에 여러개 import 시키지 않아도됨
// Video.formatHashtags(hashtags);
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

// 아래 얘는 middleware임 얘가 가로채서 아래의 해시태그를 수정해주고있음!
// 강의 6.24 에서 생긴 문제 발생! 이 기능이 save와 update 두 군데 다 필요함 각각 두개를 만들어도 되지만 그건 코드상 좋지않음 코드는 남겨두겠음
// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });

// middleware는 무조건 model이 생성되기 전에 만들어야됨
const Video = mongoose.model("Video", videoSchema);

export default Video;
