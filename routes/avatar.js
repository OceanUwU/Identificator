const fs = require('fs');
const Jimp = require('jimp');

function avatarPath(userID) {
    let path = "store/avatars/"+userID+".png";
    if (!fs.existsSync(path))
        path = "public/i/default-avatar.png";
    return path;
}

global.app.get('/avatar/:userID.png', async (req, res) => {
    //validate userID
    let user = await global.db.User.findOne({where: {id: req.params.userID}});
    if (user == null)
        return res.send('User doesn\'t exist');

    //validate image size
    let size = (req.query.hasOwnProperty("size") ? Number(req.query.size) : 256);
    if (isNaN(size))
        return res.send("avatar size must be a number");
    else if (size > 256)
        return res.send("avatar size must be at most 256");
    else if (size <= 1)
        return res.send("avatar size must be at least 1");

    //find and send image
    let path = avatarPath(req.params.userID);
    let avatar;
    await Jimp.read(path)
        .then(async image => {
            if (req.query.hasOwnProperty("nt"))
                image.opaque();
            avatar = await image
                .resize(size, size)
                .getBufferAsync(Jimp.MIME_PNG);
        });
    
    res.contentType("png");
    res.end(avatar, "binary");
});

module.exports = avatarPath;