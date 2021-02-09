const path = require('path');
const url = require('url');
const querystring = require('querystring');
const express = require('express');
global.passport = require('passport');

const expresssession = require('express-session');
const cookieParser = require('cookie-parser');
//const crypto = require('crypto'); //crypto.createHmac('sha512', 'identificator').update(PASSWORD).digest('hex');


const codeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const codeLifespan = 5 * (1000 * 60); //5 minutes
const codeClearInterval = 1 * (1000 * 60); //1 minute

global.cfg = require('./cfg');

global.db = require('./models');

global.app = express();
global.app.set('view engine', 'pug');
global.app.use('/', express.static(__dirname + '/public'));

global.app.use(require('body-parser').urlencoded({ extended: false }));

var sessionStore = new (require("connect-session-sequelize")(expresssession.Store))({db: global.db.sequelize});
global.app.use(cookieParser());
global.app.use(expresssession({key: 'identificate', secret: global.cfg.sessSecret, resave: true, saveUninitialized: true, store: sessionStore}));
sessionStore.sync();


global.passport.serializeUser(async function(id, cb) {
    cb(null, id);
});
  
global.passport.deserializeUser(async function(id, cb) {
    let user = await global.db.User.findOne({where: {id: id}});
    cb(null, user);
});

global.app.use(global.passport.initialize());
global.app.use(global.passport.session());
require('./strategies');

global.app.get('/login', (req, res) => {
    if (req.query.hasOwnProperty('redirect_uri')) {
        try {
            req.session.redirectUri = decodeURI(req.query.redirect_uri);
        } catch (e) {
            return res.send(`${e.name}: ${e.message}`);
        }
    } else
        delete req.session.redirectUri;
    if (req.user == undefined)
        res.render('login', {enabledAuthProviders: global.enabledAuthProviders});
    else
        res.redirect('/confirm-login');
});

global.app.get('/confirm-login', (req, res) => {
    if (req.user != undefined) {
        if (global.newlyCreatedUsers.includes(req.user.id)) {
            global.newlyCreatedUsers.splice(global.newlyCreatedUsers.indexOf(req.user.id), 1);
            res.redirect('/edit-profile');
        } else if (req.session.redirectUri == undefined)
            res.redirect('/');
        else 
            res.render('confirm-login', {user: global.userToSend(req.user), host: url.parse(req.session.redirectUri).host});
    } else 
        res.redirect('/login');
});

global.app.get('/switch', (req, res) => {
    req.logout();
    res.redirect(`/login?redirect_uri=${req.session.redirectUri}`);
});

global.app.get('/login/callback', (req, res) => {
    if (req.session.hasOwnProperty('redirectUri') && req.session.redirectUri != null) {
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
        global.logAction(`Continued to ${redirectUri.host}`, req.user.id);
        res.redirect(`${redirectUri.protocol}//${redirectUri.host}${redirectUri.pathname}?${query}`);
    } else
        res.redirect('/');
});

global.app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

global.app.get('/api/auth', async (req, res) => {
    if (!req.query.hasOwnProperty('code')) return res.json({error: 'No code supplied.'});
    if (!codes.hasOwnProperty(req.query.code)) return res.json({error: 'Invalid code.'});
    let codeObject = codes[req.query.code];
    delete codes[req.query.code]; //ensure codes may only be used once
    let user = global.userToSend(await global.db.User.findOne({where: {id: codeObject.userID}}));
   
    res.json({id: user.id});
});


global.app.get('/api/available', async (req, res) => {
    if (!req.query.hasOwnProperty('n')) return res.send({error: 'the \'n\' query variable must be supplied'});
    if (req.query.hasOwnProperty('me') && req.user != undefined && (req.query.n.toLowerCase() == req.user.username.toLowerCase() || req.query.n.toLowerCase() == `${req.user.dName}#${req.user.discrim}`.toLowerCase())) return res.json(true);
    res.json(await global.findUserByUsername(req.query.n) == null);
});




global.app.get('/', (req, res) => res.render('index', {user: global.userToSend(req.user)}));
global.app.get('/examples', (req, res) => res.render('examples', {user: global.userToSend(req.user)}));

require('./routes');

global.parsePronouns = pronouns => {
    let p = pronouns.split('`');
    return {
        subject: p[0],
        object: p[1],
        possessive: p[2],
        possessiveIndependent: p[3],
        reflexive: p[4],
        type: Number(p[5]),
    };
};
global.parseColors = colors => {
    let c = colors.split(',').map(color => `#${color}`);
    return {
        '1': c[0],
        '2': c[1],
        '3': c[2],
        '4': c[3],
        'text': c[4],
    };
};
global.flagOrder = [
    ['id', u=>u.id],
    ['username', u=>u.username],
    ['dName', u=>({
        name: u.dName,
        discrim: u.discrim,
        tag: `${u.dName}#${u.discrim}`
    })],
    null,
    ['name', u=>u.name],
    ['bio', u=>u.bio],
    ['email', u=>u.email],
    ['website', u=>u.website],
    ['profileURL', u=>`${global.cfg.url}/u/${u.id}`],
    null,
    null,
    null,
    ['pronouns', u=>global.parsePronouns(u.pronouns)],
    null,
    ['colors', u=>global.parseColors(u.colors)],
    null,
    ['avatarURL', u=>(global.cfg.url + `/avatar/${u.id}.png`)],
];
global.userToSend = (user, flags=2**global.flagOrder.length-1) => {
    if (user == undefined) return undefined;
    let output = {};
    for (let i in flagOrder) {
        if (flagOrder[i] == null) continue;
        if ((flags >> i) % 2)
            output[flagOrder[i][0]] = flagOrder[i][1](user);
    }

    return output;
}

global.logAction = (event, userId) => {
    console.log(`${event}: ${userId} at ${new Date().toUTCString()}`);
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

global.newlyCreatedUsers = Array();

const server = global.app.listen(global.cfg.port, () => {
    console.log('Web server started.');
});