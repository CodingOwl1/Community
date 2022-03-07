const cron = require('node-cron');
const Post = require('./models/post');
const Room = require('./models/room');
const DefaultCategory = require('./models/defaultCategory');
const sortArray = require('sort-array');

const DEFAULT_CAT = [
  'music',
  'funny',
  'videos',
  'programming',
  'news',
  'fashion'
]

const deletePostsByCategory = async (cat) => {
  await Post.deleteMany({ category : cat})
}

const updateDefaultCategoryById = async (defaultCategories, oldestCategory, newCat, id) => {
  const removeIndex = defaultCategories.indexOf(oldestCategory);
  if(removeIndex > -1){
    defaultCategories.splice(removeIndex, 1);
  }
  const newDefaultCat = [newCat, ...defaultCategories];

  await DefaultCategory.findOneAndUpdate(
      {_id : id},
      {
        categories : newDefaultCat,
      },
  )
}

const updatePostById = async (topPost) => {
  const post = await Post.findById({ _id: topPost._id });
  if(post){
    post.category = topPost.title;
    await post.save();
  }
}

const updateRoomTopics = async (room, oldestCategory, newCat) => {
  const removeIndex = room.topics.indexOf(oldestCategory);
  let topics = room.topics;
  if(removeIndex > -1){
    topics.splice(removeIndex, 1);
  }
  const newTopics = [newCat, ...topics];

  await Room.findOneAndUpdate(
      {_id : room._id},
      {
        topics: newTopics,
      },
  )
}

cron.schedule('*/1 * * * *', async () => {
  const posts = await Post.aggregate([
    {
      $addFields: { noOfVotes: { $size: '$votes' } }
    },
    {
      $match: { swap: true }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: 1
    }
  ]);
  if (!posts.length) return;
  const topPost = posts[0];

  let oldestCategory, result, defaultCategories, room;
  if (topPost.inRoom) {
    room = await Room.findById(topPost.inRoom);
    defaultCategories = room.topics
    oldestCategory = await getOldestCategory(defaultCategories);
  } else {
    result = await DefaultCategory.find({})
    defaultCategories = result[0].categories || DEFAULT_CAT
    oldestCategory = await getOldestCategory(defaultCategories);
  }

  if(!defaultCategories.includes(topPost.title)){

    // update highest up voted post with new category
    await updatePostById(topPost);

    // delete old category posts and comments
    await deletePostsByCategory(oldestCategory);

    // update default categories
    if(topPost.inRoom){
      await updateRoomTopics(room, oldestCategory, topPost.title);
    }else{
      await updateDefaultCategoryById(defaultCategories, oldestCategory, topPost.title, result[0]._id);
    }
  }
});

const getOldestCategory = async (topics) => {
  let _posts = [];
  for (var i = 0; i < topics.length; i++) {
    await Post.find({ category: topics[i] }, (err, posts) => {
      const post = posts[0];
      _posts.push(post);
    })
      .sort({ createdAt: -1 })
      .limit(1);
  }

  const sortedPosts = sortArray(_posts, { by: 'created', order: 'desc' });
  return sortedPosts[0].category;
};
