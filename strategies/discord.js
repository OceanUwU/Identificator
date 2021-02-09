const DiscordStrategy = require('passport-discord').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/discord', global.passport.authenticate('discord', {scope: ['identify']}));
    global.app.get('/auth/discord/callback', global.passport.authenticate('discord', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new DiscordStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/discord/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('discord', profile.id));
        }
    ));
}