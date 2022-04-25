import User from "../models/User";
import fetch from "node-fetch";
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
  const user = await User.findOne({ username, socialOnly: false });
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

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    // allow_signup 동의받을 때 아래 회원가입 생성 여부
    allow_signup: false,
    // scope 이 user로 뭘 할 것인지 설정
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  // 위에 정보를 다 받아왔으면 userRouter.get("/github/finish", finishGithubLogin)로 값을 보냄
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    // 기존 user 찾아서 로그인 시켜주기 코드시작
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      // 계성 생성하는걸 추가 (해당 email로 user가 없으니 계정을 생성해줘야한다는 말)
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : "Unknown",
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("see");
