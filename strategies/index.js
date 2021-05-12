const credentials = require('../credentials');
global.enabledAuthProviders = Object.keys(credentials);

const idLength = 16;
const idCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

const idTaken = async id => await global.db.User.count({where: {[db.Sequelize.Op.or]: [{id: id}, {username: id}, {dName: id}]}});

async function generateID() {
    let newId;
    do {
        newId = String();
        for (let i = 0; i < idLength; i++)
            newId += idCharacters.charAt(Math.floor(Math.random() * idCharacters.length));
    } while (await idTaken(newId) > 0);
    return newId;
}

async function auth(using, auth_string, exID=null) {
    let users = await global.db.User.findAll({where: {
        using: using,
        authString: auth_string
    }});
    if (users.length > 0) { //If a user with the specified auth string exists,
        global.logAction(`Sign-in through ${using}`, users[0].id);
        return users[0].id; //store the ID of that user in the session.
    } else { //If a user with the specified auth string doesn't already exist, create a new one.
        let newId = using == 'password' ? auth_string : await generateID();
        if (await idTaken(newId) > 0 || newId.length != idLength || !/^[0-9a-z]+$/.test(newId))
            return false;
        await global.db.User.create({
            id: newId,
            using: using,
            authString: auth_string,
            username: newId,
            dName: newId,
            discrim: `${String(Math.random()).slice(2,2+3)}A`,
            name: newId,
            bio: 'Hi!',
            website: `${global.cfg.url}/u/${newId}`,
            pronouns: 'they`them`their`theirs`themself`1',
            colors: 'EEEEEE,DDDDDD,CCCCCC,BBBBBB,111111',
            email: 'example@example.com'
        });
        global.newlyCreatedUsers.push(newId);
        global.logAction(`Sign-up through ${using}`, newId);
        return newId;
    }
}

module.exports = {
    auth,
    generateID
};

const strategies = {
    'discord': require('./discord'),
    'google': require('./google'),
    'wordpress': require('./wordpress'),
    'reddit': require('./reddit'),
    'github': require('./github'),
    'gitlab': require('./gitlab'),
    'facebook': require('./facebook'),
    'steam': require('./steam'),
    'yandex': require('./yandex'),
    'auth0': require('./auth0'),
    'identificator': require('./identificator'),
    'password': require('./password'),
};

for (let i in strategies)
    if (credentials.hasOwnProperty(i))
        strategies[i](auth, credentials[i]);