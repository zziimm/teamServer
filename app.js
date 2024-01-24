const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const paasport = require('passport');


dotenv.config();
const matchingRouter = require('./routes/matching');
const communityRouter = require('./routes/community')
const userRouter = require('./routes/user');
const myCalendarRouter = require('./routes/myCalendar');
const myPageRouter = require('./routes/myPage');
const { connect } = require('./database/index');
const passportConfig = require('./passport');



// 라우터 가져오기
const registerRouter = require('./routes/register')
const clubRouter = require('./routes/club')
const clubInsertRouter = require('./routes/clubInsert')



const app = express();
app.set('port', process.env.PORT || 3002);
passportConfig();
connect();

app.use(cors({
  origin: 'https://minton1000.netlify.app',
  credentials: true
}));
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json())
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.minton1000.netlify.app/'
  },
  name: 'session-cookie'
}));
app.use(paasport.initialize());
app.use(paasport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// 라우터를 미들웨어로 등록
app.use('/', matchingRouter);
app.use('/community', communityRouter);
app.use('/user', userRouter);
app.use('/myCalendar', myCalendarRouter);
app.use('/register', registerRouter);
app.use('/club', clubRouter);
app.use('/myPage', myPageRouter);
app.use('/clubInsert', clubInsertRouter)




app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(err)
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port') + '번에서 서버 실행 중입니다.');
});