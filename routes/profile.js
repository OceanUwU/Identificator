const base62 = require('base62');
const e = require('express');
const cors = require('cors');
const { render } = require('pug');

global.findUserByUsername = str => {
    return new Promise(async (res, rej) => {
        if (str.includes('#')) {
            res(await global.db.User.findOne({where: {
                [db.Sequelize.Op.and]: [
                    db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('dName')), db.Sequelize.fn('lower', str.slice(0, str.indexOf('#')))),
                    db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('discrim')), db.Sequelize.fn('lower', str.slice(str.indexOf('#')+1)))
                ]
            }}));
        } else {
            res(await global.db.User.findOne({where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('username')), db.Sequelize.fn('lower', str))}));
        }
    });
};

const renderProfile = (req, res) => {
    res.render('profile', {user: global.userToSend(req.user), userFound: global.userToSend(res.locals.userFound), flagOrder: global.flagOrder});
};

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

global.app.get('/u/:userID/', /*cors(corsOptions),*/ async (req, res, next) => {
    res.locals.userFound = await global.db.User.findOne({where: {id: req.params.userID}});
    next();
}, renderProfile);

global.app.get('/un/:toFind/', /*cors(corsOptions),*/ async (req, res, next) => {
    res.locals.userFound = await global.findUserByUsername(req.params.toFind);
    next();
}, renderProfile);


const sendJSON = (req, res) => {
    console.log('s');
    //res.set('Access-Control-Allow-Origin', '*');
    if (res.locals.userFound == null)
        return res.json(null);
    res.json(global.userToSend(res.locals.userFound, req.query.f ? base62.decode(req.query.f) : undefined));
};

global.app.get('/u/:userID/json', cors(), async (req, res, next) => {
    res.locals.userFound = await global.db.User.findOne({where: {id: req.params.userID}});
    next();
}, sendJSON);

global.app.get('/un/:toFind/json', cors(), async (req, res, next) => {
    res.locals.userFound = await global.findUserByUsername(req.params.toFind);
    next();
}, sendJSON);