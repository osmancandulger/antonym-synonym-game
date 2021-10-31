module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/antonym-synonym-game/' : '/',
  env: require('dotenv').config({ path: './.env' }),
};
