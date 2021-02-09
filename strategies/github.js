const GithubStrategy = require('passport-github').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/github', global.passport.authenticate('github', {scope: ['read:user']}));
    global.app.get('/auth/github/callback', global.passport.authenticate('github', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new GithubStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/github/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('github', profile.id));
        }
    ));
}