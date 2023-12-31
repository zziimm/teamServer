const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { client } = require('../database/index');
const db = client.db('minton');

module.exports = () => {
  // 첫번째 인자값: 전략 옵션을 설정 가능
  // 예:
  // username, password 외 다른 속성명(req.body.name)을 쓰고 싶을 때
  // 아이디/비번 외에 다른 것도 제출받아서 검증하고 싶을 때 => passReqToCallback 옵션 참고
  // 두번째 인자값: 실제 전략(=로그인 시 어떻게 처리할지 동작)을 수행하는 함수
  passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'passwd',
    passReqToCallback: false
  }, async (userId, passwd, done) => { //  passport.authenticate('local')(); 사용 시 호출되는 콜백 함수
    try {
      const existUser = await db.collection('userInfo').findOne({ userId });
      console.log(existUser);
      if (!existUser) {
        return done(null, false, { message: '가입되지 않은 회원입니다.' });
      }

      // 해싱할 비번(사용자가 입력한 비번)과 해싱된 비번(DB에 저장된 비번)을 비교
      const result = await bcrypt.compare(passwd, existUser.passwd);
      if (!result) { // 비번이 틀리면
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
      }
      // 아이디, 비번 일치 시
      return done(null, existUser);
    } catch (err) {
      console.error(err);
      done(err);
    }
  }));
};