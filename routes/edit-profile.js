const fs = require('fs');
const Jimp = require('jimp');
const multer = require('multer');

const limits = {
    username: 16,
    dName: 16,
    discrim: 4,
    name: 20,
    bio: 150,
    website: 70,
    pronoun: 12,
    avatar: [1 * 1024 * 1024, '1MB'],
    email: 30
}
const availableChars = {
    usernames: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_',
    discrim: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}
const pronounOrder = ['subject', 'object', 'possessive', 'possessiveIndependent', 'reflexive', 'type'].map(name => `${name}Pronoun`);
const colorOrder = [1, 2, 3, 4, 'Text'].map(n => `color${n}`);

global.app.get('/edit-profile', (req, res) => res.render('edit-profile', {user: global.userToSend(req.user), limits, availableChars}));


var upload = multer({
    dest: "temp",
    limits: {
        fileSize: limits.avatar[0],
    }
}).single("avatar");

global.app.post('/edit-profile', async (req, res, next) => {
    upload(req, res, async err => {
        if (err instanceof multer.MulterError)
            return res.send("error uploading avatar")

        if (req.user == undefined) return res.send("You aren't logged in."); //if not logged in

        //validate username
        if (typeof req.body.username != 'string' || req.body.username.length > limits.username || req.body.name.length == 0 || !(req.body.username.split('').every(char => availableChars.usernames.includes(char)))) req.body.username = req.user.username;
        else {
            //check username isnt taken
            let usernameOwner = await global.db.User.findOne({
                where: {
                    username: req.body.username
                }
            });
            if (usernameOwner != null && usernameOwner.id != req.user.id) req.body.username = req.user.username;
        }
        //validate discrim name
        if (typeof req.body.usernameD != 'string' || req.body.usernameD.length > limits.dName || req.body.usernameD.length == 0 || !(req.body.usernameD.split('').every(char => availableChars.usernames.includes(char)))) req.body.usernameD = req.user.dName;
        if (typeof req.body.discriminator != 'string' || req.body.discriminator.length > limits.discrim || req.body.discriminator.length == 0 || !(req.body.discriminator.split('').every(char => availableChars.discrim.includes(char)))) req.body.discriminator = req.user.discrim;
        //check discrim name isnt taken
        let dNameOwner = await global.db.User.findOne({
            where: {
                dName: req.body.usernameD,
                discrim: req.body.discriminator
            }
        });
        if (dNameOwner != null && dNameOwner.id != req.user.id) {
            req.body.usernameD = req.user.dName;
            req.body.discriminator = req.user.discrim;
        }
        //validate name
        if (typeof req.body.name != 'string' || req.body.name.length > limits.name || req.body.name.length == 0) req.body.name = req.user.name;
        //validate bio
        if (typeof req.body.bio != 'string' || req.body.bio.length > limits.bio || req.body.bio.length == 0) req.body.bio = req.user.bio;
        //validate website
        if (typeof req.body.website != 'string' || req.body.website.length > limits.website || req.body.website.length == 0) req.body.website = req.user.website;
        else if (!(req.body.website.startsWith("http://") || req.body.website.startsWith("https://") || req.body.website.startsWith("://") || req.body.website.startsWith("//")))
            req.body.website = "http://" + req.body.website;
        //validate pronouns
        for (let i in pronounOrder) {
            let k = pronounOrder[i];
            switch(k) {
                case 'typePronoun':
                    if (typeof req.body[k] != 'string' || !['0', '1'].includes(req.body[k]))
                        req.body[k] = global.parsePronouns(req.user.pronouns)[i];
                    break;

                default:
                    req.body[k] = req.body[k].replace('`', '\'');
                    if (typeof req.body[k] != 'string' || req.body[k].length > limits.pronoun || req.body[k].length == 0)
                        req.body[k] = global.parsePronouns(req.user.pronouns)[i];
            }
        }
        let pronouns = pronounOrder.map(n => req.body[n]).join('`');
        //validate style colors
        for (let i in colorOrder) {
            let k = colorOrder[i];
            if (typeof req.body[k] != 'string' || !(/^#[0-9A-F]{6}$/.test('#AABBCC')))
                req.body[k] = global.parseColors(req.user.colors)[i];
            req.body[k] = req.body[k].slice(1);
        }
        let colors = colorOrder.map(n => req.body[n]).join(',');
        //validate email
        if (typeof req.body.email1 != 'string' || req.body.email1.length > limits.bio || req.body.email1.length == 0) req.body.email1 = user.email.slice(0, user.email.indexOf('@'));
        if (typeof req.body.email2 != 'string' || req.body.email2.length > limits.bio || req.body.email2.length == 0) req.body.email2 = user.email.slice(user.email.indexOf('@')+1, user.email.indexOf('.'));
        if (typeof req.body.email3 != 'string' || req.body.email3.length > limits.bio || req.body.email3.length == 0) req.body.email3 = user.email.slice(user.email.indexOf('.')+1);
        let email = `${req.body.email1}@${req.body.email2}.${req.body.email3}`;
        //validate and save avatar image
        if (req.file != undefined) {
            let imageIsSet = false;
            await Jimp.read(req.file.path)
                .then(image => {
                    image
                        .resize(256, 256)
                        .write("store/avatars/"+req.user.id+".png");
                    imageIsSet = true;
                })
                .catch(err => {
                    return res.send("error reading avatar file. is it the wrong format? is it corrupted?");
                });
            fs.unlinkSync(req.file.path); //delete temp file
            if (!imageIsSet) return;
        }
        //update user
        await global.db.User.update({
            username: req.body.username,
            dName: req.body.usernameD,
            discrim: req.body.discriminator,
            name: req.body.name,
            bio: req.body.bio,
            website: req.body.website,
            pronouns: pronouns,
            colors: colors,
            email: email,
        }, {where: {id: req.user.id}});
        if (req.session.hasOwnProperty('redirectUri') && req.session.redirectUri != null)
            res.redirect('/confirm-login');
        else res.redirect(`/u/${req.user.id}/`);
    });
});