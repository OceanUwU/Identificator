const WordpressStrategy = require('passport-wordpress').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/wordpress', global.passport.authenticate('wordpress', {scope: ['auth']}));
    global.app.get('/auth/wordpress/callback', global.passport.authenticate('wordpress', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new WordpressStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/wordpress/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('wordpress', profile.id));
        }
    ));
}