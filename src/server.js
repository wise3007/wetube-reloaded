import express from "express";
// morgan이란 플러그인은 middleware를 return해주는 역할
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");
// morgan이란 플러그인은 middleware를 return해주는 역할
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));

// session은 라우터 위에 써줘야됨
app.use(
  session({
    secret: process.env.COOKIE_SECRERT, //secret: 세션을 암호화 해줌
    resave: false, //resave: 세션을 항상 저장할지 여부를 정하는 값. (false 권장)
    saveUninitialized: false, //saveUninitialized: 초기화되지 않은채 스토어에 저장되는 세션
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);
// session은 라우터 위에 써줘야됨

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
