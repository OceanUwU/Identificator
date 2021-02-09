const GitlabStrategy = require('passport-gitlab2').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/gitlab', global.passport.authenticate('gitlab', {scope: ['read_user']}));
    global.app.get('/auth/gitlab/callback', global.passport.authenticate('gitlab', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new GitlabStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/gitlab/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('gitlab', profile.id));
        }
    ));
}