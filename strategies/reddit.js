const RedditStrategy = require('passport-reddit').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/reddit', global.passport.authenticate('reddit', {scope: ['identity']}));
    global.app.get('/auth/reddit/callback', global.passport.authenticate('reddit', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new RedditStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/reddit/callback',
            state: "identitytime",
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('reddit', profile.id));
        }
    ));
}