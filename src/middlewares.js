export const localsMiddleware = (req, res, next) => {
  //   if (req.session.loggedIn) {
  //     res.locals.loggedIn = true;
  //   } 아래 코드는 이 코드를 짧게한거
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Webtube";
  res.locals.loggedInUser = req.session.user;
  next();
};
