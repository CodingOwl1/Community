module.exports = {
  port: 8080,
  db: {
    prod: 'mongodb+srv://test1:test1@cluster0.wsfac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority' || 'mongodb://localhost/reddit-clone',
    test: 'mongodb://localhost/reddit-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development_secret',
    expiry: '7d'
  }
};
