export default () => ({
  env: process.env.APP_ENV,
  port: Number(process.env.PORT),
  jwtAccessSecret: process.env.USER_JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.USER_JWT_REFRESH_SECRET,
  accessExpiresIn: Number(process.env.ACCESS_ExpiresIn),
  refreshExpiresIn: Number(process.env.REFRESH_ExpiresIn),
  sms_service: {
    url: process.env.SMS_API,
    username: process.env.SMS_USERNAME,
    password: process.env.SMS_PASSWORD,
    orginator: process.env.SMS_ORGINATOR,
    auth: process.env.SMS_AUTH,
  },
});
