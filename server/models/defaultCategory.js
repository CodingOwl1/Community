const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defaultCategory = new Schema({
    categories: {
        type: Array,
        required: false,
        default: [
            'music',
            'funny',
            'videos',
            'programming',
            'news',
            'fashion'
        ]
    }
});

module.exports = mongoose.model('defaultCategory', defaultCategory);
