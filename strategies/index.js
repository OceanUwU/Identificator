const credentials = require('../credentials');
global.enabledAuthProviders = Object.keys(credentials);

const idLength = 16;
const idCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

async function auth(using, auth_string) {
    let users = await global.db.User.findAll({where: {
        using: using,
        authString: auth_string
    }});
    if (users.length > 0) { //If a user with the specified auth string exists,
        global.logAction(`Sign-in through ${using}`, users[0].id);
        return users[0].id; //store the ID of that user in the session.
    } else { //If a user with the specified auth string doesn't already exist, create a new one.
        let newId, idTaken;
        do {
            newId = String();
            for (let i = 0; i < idLength; i++)
                newId += idCharacters.charAt(Math.floor(Math.random() * idCharacters.length));
            idTaken = await global.db.User.count({where: {[db.Sequelize.Op.or]: [{id: newId}, {username: newId}, {dName: newId}]}});
        } while (idTaken > 0);
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
};

for (let i in strategies)
    if (credentials.hasOwnProperty(i))
        strategies[i](auth, credentials[i]);