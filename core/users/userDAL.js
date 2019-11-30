const User = require('./user');

/**
 * @desc Returns a user searched by email
 * @param email
 */
async function getUserByEmail(email) {
    try {
        return await User.findOne({email});
    } catch (e) {
        return null;
    }
}

async function getUserById(id) {
    try {
      return await User.findById(id);
    } catch (e) {
        throw new Error('getUserById - Internal Server Error');
    }
}

module.exports = {
    getUserByEmail,
    getUserById
};

