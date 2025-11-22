module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://kikalo.onrender.com/:path*'
      }
    ]
  }
}
