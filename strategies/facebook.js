const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/facebook', global.passport.authenticate('facebook', {scope: []}));
    global.app.get('/auth/facebook/callback', global.passport.authenticate('facebook', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new FacebookStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/facebook/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('facebook', profile.id));
        }
    ));
}