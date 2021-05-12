const IdentificatorStrategy = require('passport-identificator').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/identificator', global.passport.authenticate('identificator'));
    global.app.get('/auth/identificator/callback', global.passport.authenticate('identificator', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    console.log(encodeURIComponent(global.cfg.url+'/auth/identificator/callback'))
    global.passport.use(new IdentificatorStrategy(
        {
            identificatorHost: credentials,
            callbackURL: encodeURIComponent(global.cfg.url+'/auth/identificator/callback')
        },
        async (profile, cb) => {
            cb(null, await auth('identificator', profile.id));
        }
    ));
}