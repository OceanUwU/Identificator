const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/google', global.passport.authenticate('google', {scope: ['profile']}));
    global.app.get('/auth/google/callback', global.passport.authenticate('google', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new GoogleStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('google', profile.id));
        }
    ));
}