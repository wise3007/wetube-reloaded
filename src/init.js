// package.json에서 가장 먼저실행되도록 한 파일 init임

import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const POST = 4000;

const handleListening = () =>
  console.log(`👍 Server listening on port http://localhost:${POST}`);

app.listen(POST, handleListening);
