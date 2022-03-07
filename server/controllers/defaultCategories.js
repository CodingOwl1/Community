const DefaultCategory = require('../models/defaultCategory');

exports.getDefaultCategory = async (req, res) => {
    try {
        const cat = await DefaultCategory.find({});
        res.send({
            status: 'success',
            data: cat[0].categories
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Something went wrong.'
        });
    }
};
