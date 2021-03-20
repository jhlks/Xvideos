const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const sqlite3 = require("sqlite3");

puppeteer.use(StealthPlugin())

let db = new sqlite3.Database('banco.db', (err) => {
    if (err)
        console.error(err.message);
    console.log('Bando de Dados OK!');
});

const token = '1629078447:AAEulQs_agjtz2AxleDVjVCFUaR-LZ-R_98';
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => 
{
    const str = msg.text;
    const Xvideos = /(https\:\/\/www.xvideos\.red\/video\d{8}\/\w+)/g;
    const ChatId = msg.chat.id;
    const UserId = msg.from.id
    const UserName = msg.from.first_name;
    const User = msg.from.username ? msg.from.username : 'Vazio';
    
    if( Xvideos.test(str) === true ) 
    {
        const Usuario = await searchUserById(UserId);
        const VideoID = str.match(/(\d{8})/)[1];

        if( Number(Usuario[0]['Pontos']) > 0 ) 
        {
            console.log('RED', VideoID);
            bot.sendMessage(msg.from.id, 'Pedido recebido, aguarde...');
            
            await GetVideo(VideoID).then( async info => {
                // const videoMP4 = 'http://adf.ly/16408729/https://jhlks.github.io/goto/?ref=' + base64(info.videoUrlHigh);
                // const NovaPontuacao = Usuario[0]['Pontos'] - 1;
                // await UpdateUser('Pontos', NovaPontuacao, UserId);
                // bot.sendPhoto(msg.from.id, info.mozaique, { caption: `🎬 ${info.title} \n\n💎 Pontos restantes: ${NovaPontuacao}`, reply_markup: { inline_keyboard: [[{text: 'MP4 VIDEO', url: `${videoMP4}` }]]}});
            }).catch(err => {
                bot.sendMessage(msg.from.id, 'erro: 39');
                console.log(err);
            });
        } else {
            bot.sendMessage(msg.from.id, 'Você não tem pontos o suficiente para completar esta ação.');
        }

    } else if ( str.split(" ")[0] === '/start' ) {

        const Usuario = await searchUserById(UserId);

        if(Usuario.length === 0) {
            await insertNewUser( UserId, User, UserName, '1' );
            bot.sendMessage(ChatId, `Bem Vindo ${UserName} \n\n⚙️ Envie um link do video, do Xvideos Red, Que eu vou usar seus pontos para te enviar o vídeo. \n Se você não tem pontos use (/convidar) para ganhar mais ponto grátis.`);
        } else {
            bot.sendMessage(ChatId, `Olá Novamente ${Usuario[0]['Nome']} ❤️ \n\n⚙️ Envie um link do video, do Xvideos Red, Que eu vou usar seus pontos para te enviar o vídeo.`);
        }

        if( str.replace('/start', '').trim().length > 0 ) 
        {
            const IdUserRef = str.replace('/start', '').trim();
            const UserSearchRef = await searchUserById(IdUserRef);

            if( UserSearchRef.length > 0 ) 
            {
                if( UserId === UserSearchRef[0].IdUser ) {
                    bot.sendMessage(ChatId, '❗️ Você não pode convidar así mesmo.', { parse_mode: 'HTML' });
                } else {
                    const NovaPontuacao = UserSearchRef[0]['Pontos'] + 2;
                    const NovaNumReferencia = UserSearchRef[0]['Referencia'] + 1;

                    await UpdateUser('Pontos', NovaPontuacao, UserSearchRef[0]['IdUser']);
                    await UpdateUser('Referencia', NovaNumReferencia, UserSearchRef[0]['IdUser']);
                }
            } else {
                console.log('Usuario não existe, erro: 69');
            }
        }
    } else if( str === '/convidar' ) {
        bot.sendMessage(ChatId, `Convide para ganhar pontos! \n🔥 A cada amigo que acessa seu link de convite, você ganha 2 pontos! \nSeu Link de convite: https://t.me/xlxvideosredbot?start=${UserId} \n✨ Mande para seus amigos e ganhe pontos grátis! \n\n❕ Os postos servem para você poder usar o bot.`, { parse_mode: 'HTML' })
    } else if ( str === '/pontos' ) {
        const Usuario = await searchUserById(UserId);
        bot.sendMessage(ChatId, `💎 Pontos: ${Usuario[0]['Pontos']} \n👥 ${Usuario[0]['Referencia']} Pessoas usaram seu link de convite \n\n❕ Ganhe pontos convidando amigos (/convidar)`);
    } else {
        console.log('falha');
    }
});

bot.on("polling_error", console.log);

var main;
async function GetVideo(Video) {

    let video = {
        title: null,
        mozaique: null,
        videoUrlHigh: null,
        videoHLS: null,
        thumb: null
    };

    return new Promise((resolve, reject) => {
        puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']}).then(async browser => {
            main = await browser.pages();
            main = main[0];
            await main.goto('https://www.xvideos.com/account', { waitUntil: 'load', timeout: 0 });
            await main.waitForSelector('button[type="submit"]');
            await main.type('#signin-form_login', 'playsexy2023@gmail.com');
            await main.type('#signin-form_password', '19mar.redhot');
            await main.click('button.btn.btn-danger');
            await sleep(5000);
            await main.goto('https://www.xvideos.red/video' + Video + '/', { waitUntil: 'load', timeout: 0 });
            await main.waitForSelector('.page-title');

            var html = await main.evaluate(function() {
                return document.getElementsByTagName('html')[0].innerHTML;
            });

            fs.writeFileSync('file.txt', html);
            await main.screenshot({path: 'example3.png'});
            console.log('html');

            // var Title = Getstring(html, "setVideoTitle(", ");");
            // var Mozaique = Getstring(html, "setThumbSlideBig(", ");");
            // var VideoUrlHigh = Getstring(html, "setVideoUrlHigh(", ");");
            // var VideoHLS = Getstring(html, "setVideoHLS(", ");");
            // var Thumb = Getstring(html, "setThumbUrl169(", ");");
            
            // video.title = Title.substring(2 , Title.length -2);
            // video.mozaique = Mozaique.substring(2 , Mozaique.length -2);
            // video.videoUrlHigh = VideoUrlHigh.substring(2 , VideoUrlHigh.length -2);
            // video.videoHLS = VideoHLS.substring(2 , VideoHLS.length -2);
            // video.thumb = Thumb.substring(2 , Thumb.length -2);

            if(video) {
                resolve(video);
            } else {
                reject('Falha');
            }

            await browser.close();
        });
    });

};

async function UpdateUser(update, value, UserId) {
    return new Promise((resolve, reject) => {
        db.serialize(function() {
            db.run(`UPDATE Users SET ${update} = ${value} WHERE IdUser = ${UserId}`, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }); 
        });
    });     
}

async function insertNewUser(id, user, nome, pontos) {
    return new Promise((resolve, reject) => {
        db.serialize(function() {
            db.run(`INSERT INTO Users('IdUser', 'User', 'Nome', 'Pontos', 'Referencia') VALUES ( '${id}' , '${user}', '${nome}', '${pontos}', '0')`, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }); 
        });
    });     
}

async function searchUserById(id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Nome, IdUser, User, Pontos, Referencia FROM Users WHERE IdUser = ${id} LIMIT 1`, (err, res) => {
            if(err) {
                reject(err)
            } else{
                resolve(res);
            }
        }); 
    });
}


function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function Getstring(str, first_character, last_character) {
    if(str.match(first_character + "(.*)" + last_character) == null) {
        return null;
    }else{
        return str.match(first_character + "(.*)" + last_character)[1].trim()
    }
}

function base64(str){
    return Buffer.from(str).toString('base64');
}
