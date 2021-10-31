module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/antonym-synonym-game/' : '/',
};
require('dotenv').config({ path: './.env' });
