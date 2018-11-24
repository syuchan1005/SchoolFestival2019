module.exports = {
  chainWebpack(config) {
    config.module
      .rule('graphql').test(/\.graphql$/)
      .use('graphql-tag/loader').loader('graphql-tag/loader')
      .end();
  },
  devServer: {
    public: 'http://localhost:8081',
  },
  pwa: {
    name: 'School Festival 2019',
    themeColor: '#4caf50',
    msTileColor: '#4caf50',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    iconPaths: {
      favicon32: 'icons/32.png',
      favicon16: 'icons/16.png',
      appleTouchIcon: 'icons/apple.png',
      maskIcon: 'icon.svg',
      msTileImage: 'icons/144.png',
    },
  },
};
