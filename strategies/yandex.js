const YandexStrategy = require('passport-yandex').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/yandex', global.passport.authenticate('yandex', {scope: []}));
    global.app.get('/auth/yandex/callback', global.passport.authenticate('yandex', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    global.passport.use(new YandexStrategy(
        {
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/yandex/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('yandex', profile.id));
        }
    ));
}