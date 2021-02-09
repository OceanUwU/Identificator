const SteamStrategy = require('passport-steam').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/steam', global.passport.authenticate('steam', {scope: []}));
    global.app.get('/auth/steam/callback', global.passport.authenticate('steam', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new SteamStrategy(
        {
            apiKey: credentials,
            returnURL: global.cfg.url+'/auth/steam/callback'
        },
        async (identifier, profile, cb) => {
            cb(null, await auth('steam', profile.id));
        }
    ));
}