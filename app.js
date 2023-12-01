const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3002);

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));  // '/' 경로가 루트면 생략 가능  app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,  // 개발단계에서는 false로
  },
  name: 'session-cookie'
}));






app.listen(app.get('port'), () => {
  console.log(app.get('port') + '번에서 서버 실행 중');
});