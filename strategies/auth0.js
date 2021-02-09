const Auth0Strategy = require('passport-auth0').Strategy;

module.exports = (auth, credentials) => {
    global.app.get('/auth/auth0/', (req, res) => res.redirect(`https://${credentials.domain}/v2/logout?returnTo=${encodeURIComponent(global.cfg.url+"/auth/auth0/real")}&client_id=${credentials.id}`));
    global.app.get('/auth/auth0/real', global.passport.authenticate('auth0', {scope: 'openid'}));
    global.app.get('/auth/auth0/callback', global.passport.authenticate('auth0', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/confirm-login'));

    if (credentials.hasOwnProperty("connections"))
        for (i of credentials.connections) {
            global.app.get('/auth/'+i, (req, res) => res.redirect('/auth/auth0'));
            global.enabledAuthProviders.push(i);
        }

    global.passport.use(new Auth0Strategy(
        {
            domain: credentials.domain,
            clientID: credentials.id,
            clientSecret: credentials.secret,
            callbackURL: global.cfg.url+'/auth/auth0/callback',
            state: true
        },
        async (accessToken, refreshToken, extraParams, profile, cb) => {
            cb(null, await auth('auth0', profile.id));
        }
    ));
}