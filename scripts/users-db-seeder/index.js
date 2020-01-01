const mongoose = require('mongoose');
const User = require('../../core/users/user');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

init()
    .then(() => {
    log('Done with success');
    process.exit(0);

})
    .catch(err => {
        log('Done with problems');
        process.exit(1);
    });

async function init() {
    log('Running users db seeder...');
    let password = null;

    /* Connect to database */
    try {
        log('Connecting to database...');
        await mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
    } catch (e) {
        log('Database connection error');
        throw new Error('Database connection error')
    }

    /* Cleaning database... */
    try {
        log('Cleaning database...');
        await User.deleteMany({});
    } catch (e) {
        throw new Error('Cleaning database');
    }

    /* Generate password */
    try {
        log('Hashing password...');
        password = bcrypt.hashSync('iwords');
    } catch (e) {
        log('Hashing password error');
        throw new Error('Hashing password error');
    }

    /* Preparing users */
    try {
        log('Preparing users...');

        const regularUser = new User({
            name: 'Przemysław Chudziński',
            email: 'przemyslaw-chudzinski@wp.pl',
            password,
            apiKeys: {
                chromeExt: {
                    token: uuid()
                }
            }
        });

        const adminUser = new User({
            name: 'Adam Chudziński',
            email: 'adam-chudzinski@wp.pl',
            password,
            apiKeys: {
                chromeExt: {
                    token: uuid()
                }
            }
        });

        await regularUser.save();
        await adminUser.save();

    } catch (e) {
        throw new Error('Preparing users error');
    }

}

function log(message = '') {
    console.log('[DB USER SEEDER] ' + message);
}
