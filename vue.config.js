module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/antonym-synonym-game/' : '/',
};
process.env.NODE_ENV === 'production'
  ? require('dotenv').config({ path: './.env' })
  : '';
