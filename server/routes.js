const users = require('./controllers/users');
const posts = require('./controllers/posts');
const votes = require('./controllers/votes');
const comments = require('./controllers/comments');
const rooms = require('./controllers/rooms');
const reports = require('./controllers/reports');
const defaultCategories = require('./controllers/defaultCategories');
const blocks = require('./controllers/blocks');
const requireAuth = require('./middlewares/requireAuth');
const postAuth = require('./middlewares/postAuth');
const commentAuth = require('./middlewares/commentAuth');

const router = require('express').Router();

router.post('/report', reports.createReport);

router.post('/block', blocks.blockUser);

router.get('/user/id/:id', users.getUser);

//Search
router.get('/user/search/:q', users.search);

//Friends
router.post('/user/request', users.sendFriendRequest);
router.post('/user/unfriend', users.unfriend);
router.post('/user/request/accept', users.acceptRequest);
router.post('/user/request/decline', users.declineRequest);
router.get('/users', users.getUsers);
router.post(`/user/:id`, users.updateUser);

//Authentication
router.post('/signup', users.validate, users.signup);
router.post('/authenticate', users.validate, users.authenticate);

//Posts
router.param('post', posts.load);
router.post('/posts', [requireAuth, posts.validate], posts.create);
router.get('/post/:post', posts.show);
router.get('/posts', posts.list);
router.get('/posts/:category', posts.listByCategory);
router.get('/user/:username', posts.listByUser);
router.delete('/post/:post', [requireAuth, postAuth], posts.delete);

// default categories
router.get('/default_category', defaultCategories.getDefaultCategory);

//Post votes
router.get('/post/:post/upvote', requireAuth, votes.upvote);
router.get('/post/:post/downvote', requireAuth, votes.downvote);
router.get('/post/:post/unvote', requireAuth, votes.unvote);

//Posts comments
router.param('comment', comments.load);
router.post('/post/:post', [requireAuth, comments.validate], comments.create);
router.delete(
  '/post/:post/:comment',
  [requireAuth, commentAuth],
  comments.delete
);

// Rooms
router.post('/room', rooms.create);
router.get('/room/:id', rooms.getRoom);
router.get('/rooms/avatar', rooms.getRoomAvatars);
router.post('/room/join', rooms.joinRoom);
router.get('/room/posts/:roomId', rooms.getRoomPosts);

module.exports = (app) => {
  app.use('/api', router);

  app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message
    });
  });
};
