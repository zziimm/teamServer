const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('로그인 필요'); // 401(비인증) 또는 403(미승인) 사용
  }
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};

const checkIdAndPw = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.json({
      flag: false,
      message: '내용을 입력하세요'
    })
  } else {
    next();
  }
};

module.exports = {
  isLoggedIn,
  isNotLoggedIn,
  checkIdAndPw,
};