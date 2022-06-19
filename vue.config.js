module.exports = {
  devServer: {
    host: 'localhost',
    port: 8081
  },
 // publicPath: process.env.NODE_ENV === 'development' ? '/' : '/tutorScheduling/', - AWS
  publicPath: process.env.NODE_ENV === 'development' ? '/' : '/', 
  transpileDependencies: ['vuetify'],
}
