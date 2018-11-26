module.exports = {
  // SESSION用cookieのkey
  SESSION_KEY: 'school:sess',
  // LINEログインのコールバック，ImageMapの画像URLに利用
  BASE_URL: '',
  MESSAGING_API: {
    LINE_ACCESS_TOKEN: '',
  },
  LOGIN_API: {
    LINE_CHANNEL_ID: '',
    LINE_CHANNEL_SECRET: '',
  },
  // 新規登録のPINコードの有効期限 [ms]
  REGISTRATION_CODE_WAIT: 15000,
  // PWAログイン用の一時的なTokenの有効期限 [ms]
  TEMPORARY_TOKEN_WAIT: 15000,
  // PWAログイン用のTokenの有効期限 [day]
  TOKEN_EXPIRE_DAYS: 7,
};
