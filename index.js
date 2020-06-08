const path = require('path');
const url = require('url');
const querystring = require('querystring');
const express = require('express');
const mysql = require('mysql2');
const passport = require('passport');

const DiscordStrategy = require('passport-discord').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const WordpressStrategy = require('passport-wordpress').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const GitlabStrategy = require('passport-gitlab2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const SteamStrategy = require('passport-steam').Strategy;
const YandexStrategy = require('passport-yandex').Strategy;

const expresssession = require('express-session');
const MySQLStore = require('connect-mysql')(expresssession);
const cookieParser = require('cookie-parser');
//const crypto = require('crypto'); //crypto.createHmac('sha512', 'identificator').update(PASSWORD).digest('hex');

const codeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const codeLifespan = 5 * (1000 * 60); //5 minutes
const codeClearInterval = 1 * (1000 * 60); //1 minute

const cfg = require('./cfg');
const credentials = require('./credentials');
const enabledAuthProviders = Object.keys(credentials);

var conn = mysql.createPool({
    host: cfg.db.server,
    port: cfg.db.port,
    user: cfg.db.username,
    password: cfg.db.pw,
    database: cfg.db.db
});

var promiseConn = conn.promise();

var app = express();
app.set('view engine', 'pug');
app.use('/', express.static(__dirname + '/public'));

app.use(require('body-parser').urlencoded({ extended: false }));

var sessionStore = new MySQLStore(({pool: conn}));
app.use(cookieParser());
app.use(expresssession({key: 'identificate', secret: cfg.sessSecret, resave: true, saveUninitialized: true, store: sessionStore}));


passport.serializeUser(async function(id, cb) {
    cb(null, id);
});
  
passport.deserializeUser(async function(id, cb) {
    let user = (await promiseConn.query('SELECT * FROM users WHERE id = ?', id))[0][0];
    cb(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    if (req.query.hasOwnProperty('redirect_uri'))
        req.session.redirectUri = req.query.redirect_uri;
    else
        delete req.session.redirectUri;
    if (req.user == undefined)
        res.render('login', {enabledAuthProviders: enabledAuthProviders});
    else
        res.redirect('/confirm-login');
});

app.get('/confirm-login', (req, res) => {
    if (req.session.redirectUri == undefined)
        res.redirect('/');
    else if (req.user != undefined)
        res.render('confirm-login', {user: userToSend(req.user), host: url.parse(req.session.redirectUri).host});
    else 
        res.redirect('/login');
});

app.get('/switch', (req, res) => {
    req.logout();
    res.redirect(`/login?redirect_uri=${req.session.redirectUri}`);
});

app.get('/login/callback', (req, res) => {
    if (newlyCreatedUsers.includes(req.user.id)) {
        newlyCreatedUsers.splice(newlyCreatedUsers.indexOf(req.user.id), 1);
        res.redirect('/edit-profile');
    } else if (req.session.hasOwnProperty('redirectUri') && req.session.redirectUri != null) {
        let redirectUri = url.parse(req.session.redirectUri);
        delete req.session.redirectUri;
        let code;
        do {
            code = String();
            for (let i = 0; i < 64; i++) {
                code += codeCharacters.charAt(Math.floor(Math.random() * codeCharacters.length));
            }
        } while (codes.hasOwnProperty(code));
        codes[code] = new Code(req.user.id);
        let query;
        if (redirectUri.query != null)
            query = querystring.decode(redirectUri.query);
        else
            query = {};
        query.code = code;
        query = querystring.encode(query);
        if (redirectUri.protocol == null)
            redirectUri.protocol = "http:";
        res.redirect(`${redirectUri.protocol}//${redirectUri.host}${redirectUri.pathname}?${query}`);
    } else
        res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/api/auth', async (req, res) => {
    if (!req.query.hasOwnProperty('code')) return res.send({error: 'No code supplied.'});
    if (!codes.hasOwnProperty(req.query.code)) return res.send({error: 'Invalid code.'});
    let codeObject = codes[req.query.code];
    delete codes[req.query.code]; //ensure codes may only be used once
    let user = userToSend((await promiseConn.query('SELECT * FROM users WHERE id = ?', codeObject.userID))[0][0]);
   
    res.send(user);
});



async function auth(using, auth_string) {
    let authInfo = [using, auth_string];
    let user = (await promiseConn.query('SELECT * FROM users WHERE (`using` = ?) AND (`auth_string` = ?)', authInfo))[0];
    if (user.length > 0) { //If a user with the specified Discord ID exists,
        return user[0].id; //store the ID of that user in the session.
    } else { //If a user with the specified Discord ID doesn't already exist, create a new one.
        await promiseConn.query('INSERT INTO users (`using`, `auth_string`) VALUES (?)', [authInfo]);
        let newID = (await promiseConn.query('SELECT * FROM users WHERE (`using` = ?) AND (`auth_string` = ?)', authInfo))[0][0].id;
        newlyCreatedUsers.push(newID);
        return newID;
    }
}

if (credentials.hasOwnProperty('discord')) {
    app.get('/auth/discord', passport.authenticate('discord', {scope: ['identify']}));
    app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new DiscordStrategy(
        {
            clientID: credentials.discord.id,
            clientSecret: credentials.discord.secret,
            callbackURL: cfg.url+'/auth/discord/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('discord', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('google')) {
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));
    app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new GoogleStrategy(
        {
            clientID: credentials.google.id,
            clientSecret: credentials.google.secret,
            callbackURL: cfg.url+'/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('google', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('wordpress')) {
    app.get('/auth/wordpress', passport.authenticate('wordpress', {scope: ['auth']}));
    app.get('/auth/wordpress/callback', passport.authenticate('wordpress', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new WordpressStrategy(
        {
            clientID: credentials.wordpress.id,
            clientSecret: credentials.wordpress.secret,
            callbackURL: cfg.url+'/auth/wordpress/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('wordpress', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('reddit')) {
    app.get('/auth/reddit', passport.authenticate('reddit', {scope: ['identity']}));
    app.get('/auth/reddit/callback', passport.authenticate('reddit', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new RedditStrategy(
        {
            clientID: credentials.reddit.id,
            clientSecret: credentials.reddit.secret,
            callbackURL: cfg.url+'/auth/reddit/callback',
            state: "identitytime",
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('reddit', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('github')) {
    app.get('/auth/github', passport.authenticate('github', {scope: ['read:user']}));
    app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new GithubStrategy(
        {
            clientID: credentials.github.id,
            clientSecret: credentials.github.secret,
            callbackURL: cfg.url+'/auth/github/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('github', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('gitlab')) {
    app.get('/auth/gitlab', passport.authenticate('gitlab', {scope: ['read_user']}));
    app.get('/auth/gitlab/callback', passport.authenticate('gitlab', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new GitlabStrategy(
        {
            clientID: credentials.gitlab.id,
            clientSecret: credentials.gitlab.secret,
            callbackURL: cfg.url+'/auth/gitlab/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('gitlab', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('facebook')) {
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: []}));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new FacebookStrategy(
        {
            clientID: credentials.facebook.id,
            clientSecret: credentials.facebook.secret,
            callbackURL: cfg.url+'/auth/facebook/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('facebook', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('steam')) {
    app.get('/auth/steam', passport.authenticate('steam', {scope: []}));
    app.get('/auth/steam/callback', passport.authenticate('steam', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new SteamStrategy(
        {
            apiKey: credentials.steam,
            returnURL: cfg.url+'/auth/steam/callback'
        },
        async (identifier, profile, cb) => {
            cb(null, await auth('steam', profile.id));
        }
    ));
}

if (credentials.hasOwnProperty('yandex')) {
    app.get('/auth/yandex', passport.authenticate('yandex', {scope: []}));
    app.get('/auth/yandex/callback', passport.authenticate('yandex', {failureRedirect: '/login-error'}), (req, res) => res.redirect('/login/callback'));

    passport.use(new YandexStrategy(
        {
            clientID: credentials.yandex.id,
            clientSecret: credentials.yandex.secret,
            callbackURL: cfg.url+'/auth/yandex/callback'
        },
        async (accessToken, refreshToken, profile, cb) => {
            cb(null, await auth('yandex', profile.id));
        }
    ));
}

app.get('/u/:userID', async (req, res) => {
    let usersFound = (await promiseConn.query('SELECT * FROM users WHERE id = ?', req.params.userID))[0];
    if (usersFound.length == 0)
        usersFound = [undefined];
    res.render('profile', {user: userToSend(req.user), userFound: userToSend(usersFound[0])});
});
app.get('/api/user/:userID/json', async (req, res) => {
    let usersFound = (await promiseConn.query('SELECT * FROM users WHERE id = ?', req.params.userID))[0];
    if (usersFound.length == 0)
        return res.send('User doesn\'t exist');
    res.send(userToSend(usersFound[0]));
});

app.get('/', (req, res) => res.render('index', {user: userToSend(req.user)}));
app.get('/examples', (req, res) => res.render('examples', {user: userToSend(req.user)}));

app.get('/edit-profile', (req, res) => res.render('edit-profile', {user: userToSend(req.user)}));
app.post('/edit-profile', async (req, res) => {
    if (req.user == undefined) return;
    if (typeof req.body.name != 'string') return;
    if (typeof req.body.username != 'string') return;
    if (req.body.name.length > 16) return;
    if (req.body.name.length == 0)
        req.body.name = null;
    if (req.body.username.length > 16) return;
    if (req.body.username.length == 0)
        req.body.username = null;
    await promiseConn.query('UPDATE users SET name = ?, preferred_username = ? WHERE id = ?', [req.body.name, req.body.username, req.user.id]);
    if (req.session.hasOwnProperty('redirectUri') && req.session.redirectUri != null)
        res.redirect('/login/callback');
    else res.redirect(`/u/${req.user.id}`);
});

function userToSend(user) {
    if (user == undefined) return undefined;
    return {
        id: user.id,
        name: user.name,
        preferred_username: user.preferred_username,
    };
}

class Code {
    constructor(userID) {
        this.created = Date.now();
        this.userID = userID;
    }
}

var codes = Object();

setInterval(() => {
    for (i in codes) if(((Date.now() - codes[i].created) - codeLifespan) > 0) delete codes[i]; //delete all expired codes
}, codeClearInterval);

var newlyCreatedUsers = Array();

const server = app.listen(cfg.port, () => {
    console.log('Web server started.');
});