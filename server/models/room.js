const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomModel = new Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  bannerImage: { type: String, required: false },
  topics: { type: Array, required: true },
  members: { type: Array, required: true }
});

roomModel.set('toJSON', { getters: true });
roomModel.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Room', roomModel);
