import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  // 데이터 전달을 위해 필요한 걸 req.body에서 꺼내오기, 이렇게 해주는 이유는 코드를 줄여쓰기 위함 아니면 req.body.username이렇게 길게 써야됨
  const { name, email, username, password, password2, location } = req.body;
  if (password !== password2) {
    // 이 아래의 return을 하지 않으면 코드가 계속 진행되기 때문에 써줘야됨
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  // create가 끝나는 걸 기다리기 위해서는 await를 사용해줘야됨!
  // $or 연산자는 둘 이상의 조건에 대해 논리적 OR 연산을 수행하고 조건 중 하나 이상을 충족하는 문서를 선택합니다.
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "이미 등록된 아이디가 있습니다.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("404", { pageTitlt: "Join", errorMessage: error._message });
  }
};
export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const PAGETITLE = "Login";
  // 계정이 존재하는지 체크 (check if account exists)
  // mongoose에서 가져온 User 사용
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      PAGETITLE,
      errorMessage: "입력한 아이디가 일치하지 않습니다.",
    });
  }
  // 비밀번호가 일치하는지 체크 (check if password correct)
  // bcrypt.compare의 첫번째는 db에서 불러온 password 두번째는 입력한 패스워드를 넣어 비교한다.
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      PAGETITLE,
      errorMessage: "입력한 비밀번호가 일치하지 않습니다.",
    });
  }
  req.session.loggedIn = true;
  // req.session.user DB에서 찾은 user 위에 const로 정의되어있음
  req.session.user = user;
  return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("logout");
export const see = (req, res) => res.send("see");
