const { createCanvas, loadImage } = require('canvas');
const avatarPath = require('./avatar');

function printAt(context, text, x, y, lineHeight, fitWidth) {
    fitWidth = fitWidth || 0;
    
    if (fitWidth <= 0)
    {
        context.fillText( text, x, y );
        return;
    }
    var words = text.split(' ');
    var currentLine = 0;
    var idx = 1;
    while (words.length > 0 && idx <= words.length)
    {
        var str = words.slice(0,idx).join(' ');
        var w = context.measureText(str).width;
        if ( w > fitWidth )
        {
            if (idx==1)
            {
                idx=2;
            }
            context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
            currentLine++;
            words = words.splice(idx-1);
            idx = 1;
        }
        else
        {idx++;}
    }
    if  (idx > 0)
        context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
}

global.app.get('/card/:userID.png', async (req, res) => {
    let userFound = await global.db.User.findOne({where: {id: req.params.userID}});

    if (userFound == null)
        res.send('Couldn\'t find a user with that ID.');
    else {
        let colors = global.parseColors(userFound.colors);
        let canvas = req.query.o == 'p' ? createCanvas(200, 300) : createCanvas(300, 200);
        let ctx = canvas.getContext('2d');
        //stripey border
        if (req.query.hasOwnProperty('b')) {
            let patternCanvas = createCanvas(100, 100);
            let pctx = patternCanvas.getContext('2d', { antialias: true });
            pctx.fillStyle = "#B4645D";

            let colorList = [colors['2'], colors['3'], colors['4']];
            let lineWidth = Math.sqrt(patternCanvas.width ** 2 + patternCanvas.height ** 2)/(colorList.length*2);
            pctx.rotate(45 * Math.PI / 180);
            for (let i = 0; i <= colorList.length*2; i++) {
                pctx.fillStyle = colorList[i % colorList.length];
                pctx.fillRect((lineWidth*i)-(lineWidth/2),100,lineWidth,-200);
            }
            ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        let borderSize = req.query.hasOwnProperty('b') ? 10 : 0;
        ctx.clearRect(borderSize, borderSize, canvas.width-(borderSize*2), canvas.height-(borderSize*2));
        //background
        if (req.query.hasOwnProperty('bg')) {
            ctx.fillStyle = colors['1'];
            ctx.fillRect(borderSize, borderSize, canvas.width-(borderSize*2), canvas.height-(borderSize*2));
        }
        //profile picture
        let pfp = await loadImage(avatarPath(userFound.id));
        ctx.drawImage(pfp, req.query.o == 'p' ? 55 : 10, 10, 90, 90);
        //name
        switch (req.query.ft) {
            case 'b': ctx.fillStyle = 'black'; break;
            case 'w': ctx.fillStyle = 'white'; break;
            default: ctx.fillStyle = colors.text; break;
        }
        
        ctx.textBaseline = 'top'; 
        ctx.font = '25px Arial';
        let nameX = req.query.o == 'p' ? 100 : 110;
        let nameY = req.query.o == 'p' ? 100 : 10;
        ctx.textAlign = req.query.o == 'p' ? 'center' : 'start';
        ctx.fillText(userFound.name, nameX, nameY);
        //title
        let title;
        switch (req.query.t) {
            case 'd': title = `${userFound.dName}#${userFound.discrim}`; break;
            case 'i': title = userFound.id; break;
            case 'u': //fallthrough
            default: title = userFound.username; break;
        }
        ctx.font = '16px Arial';
        ctx.fillText(title, nameX, req.query.o == 'p' ? 128 : 38);
        //website
        if (req.query.o != 'p') {
            ctx.font = '12px Arial';
            ctx.fillText(userFound.website, nameX, 84);
        }
        //bio
        ctx.font = '15px Arial'
        ctx.textAlign = 'start';
        printAt(ctx, userFound.bio, 10, req.query.o == 'p' ? 150 : 110, 16, req.query.o == 'p' ? 180 : 280);
        //generate and send image
        canvas.createPNGStream().pipe(res);
    }
});