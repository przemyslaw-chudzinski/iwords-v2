const User = require('./user');

/**
 * @desc Returns a user searched by email
 * @param email
 */
async function getUserByEmail(email) {
    try {
        return await User.findOne({email});
    } catch (e) {
        throw new Error('getUserByEmail - Internal Server Error');
    }
}

async function getUserById(id) {
    try {
      return await User.findById(id);
    } catch (e) {
        throw new Error('getUserById - Internal Server Error');
    }
}

async function getUserByChromeExtApiKey(apiKey) {
    try {
        return await User.findOne().where('apiKeys.chromeExt.token', apiKey)
    } catch (e) {
        throw new Error('getUserByChromeExtApiKey - Internal Server Error');
    }
}

async function emailExists(email) {
    try {
        const user = await getUserByEmail(email);
        return !!user;
    } catch (e) {
        throw new Error('emailExists - Internal Server Error');
    }
}

module.exports = {
    getUserByEmail,
    getUserById,
    getUserByChromeExtApiKey,
    emailExists
};

