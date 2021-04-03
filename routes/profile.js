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

global.app.get('/u/:userID/', cors(), async (req, res, next) => {
    res.locals.userFound = await global.db.User.findOne({where: {id: req.params.userID}});
    next();
}, renderProfile);

global.app.get('/un/:toFind/', cors(), async (req, res, next) => {
    res.locals.userFound = await global.findUserByUsername(req.params.toFind);
    next();
}, renderProfile);


const sendJSON = (req, res) => {
    if (res.locals.userFound == null)
        return res.json(null);
    res.json(global.userToSend(res.locals.userFound, req.query.f ? base62.decode(req.query.f) : undefined));
};

global.app.get('/u/:userID/json', async (req, res, next) => {
    res.locals.userFound = await global.db.User.findOne({where: {id: req.params.userID}});
    next();
}, sendJSON);

global.app.get('/un/:toFind/json', async (req, res, next) => {
    res.locals.userFound = await global.findUserByUsername(req.params.toFind);
    next();
}, sendJSON);