const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;

const { auth, generateID } = require('./');
const IDValidityLength = 1000 * 60 * 60 * 24; //1 day

const passHmac = (id, password) => crypto.createHmac('sha256', id).update(password).digest('base64');

module.exports = (auth, credentials) => {
    global.app.get('/auth/password', async (req, res) => {
        //if (req.user != undefined) return res.send("Log out first."); //if not logged in

        let newID = await generateID();
        await db.AvailableLoginID.create({availableID: newID});

        res.render('login-password', {user: global.userToSend(req.user), newID});
    });
    global.app.post('/auth/password/callback', global.passport.authenticate('local', {failureRedirect: '/false'}), (req, res) => res.json(true));
    global.app.get('/false', (req, res) => res.json(false));

    global.passport.use(new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },

        async (req, username, password, cb) => {
            if (typeof username != 'string' || typeof password != 'string')
                return cb(null, false);
            
            if (req.body.method == 1) { //sign up
                await db.AvailableLoginID.destroy({where: {createdAt: {[db.Sequelize.Op.lt]: new Date(Date.now() - IDValidityLength)}}});
                let IDFound = await db.AvailableLoginID.findOne({where: {availableID: username}});
                if (IDFound == null)
                    return cb(null, false);
                await db.AvailableLoginID.destroy({where: {id: IDFound.id}});
                let created = await auth('password', IDFound.availableID);
                if (created != false) {
                    await db.Login.create({
                        user: username,
                        password: passHmac(username, password),
                    });
                    cb(null, created);
                } else
                    cb(null, false);
            } else { //login
                let userFound = await global.db.User.findOne({where: {[db.Sequelize.Op.or]: [{id: username}, {username: username}, {dName: username.slice(0, username.indexOf('#')), discrim: username.slice(username.indexOf('#')+1).toUpperCase()}]}});
                if (userFound == null)
                    return cb(null, false, {message: 'Couldn\'t find that user.'});
                let matched = (await global.db.Login.count({where: {
                    user: userFound.id,
                    password: passHmac(userFound.id, password),
                }})) > 0;

                if (matched)
                    cb(null, await auth('password', userFound.id));
                else
                    cb(null, false, {message: 'Password didn\'t match.'});
            }
            //cb(null, await auth('steam', profile.id));
        }
    ));



    global.app.get('/reset-password', (req, res) => {
        if (req.user == undefined) return res.send("You aren't logged in."); //if not logged in
    
    });
    
    global.app.post('/reset-password', (req, res) => {
        if (req.user == undefined) return res.send("You aren't logged in."); //if not logged in
    
    });
}