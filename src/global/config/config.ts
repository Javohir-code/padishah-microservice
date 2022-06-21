export default () => ({
  env: process.env.APP_ENV,
  port: Number(process.env.PORT),
  jwtSecret: process.env.USER_JWT_SECRET,
  sms_service: {
    url: process.env.SMS_API,
    username: process.env.SMS_USERNAME,
    password: process.env.SMS_PASSWORD,
    orginator: process.env.SMS_ORGINATOR,
    auth: process.env.SMS_AUTH,
  },
});
