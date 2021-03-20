const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const sqlite3 = require("sqlite3");
const fs = require('fs');

const cookies = [{
  'name': 'session_token',
  'value': 'b8f28a4425d795fcWMpYcnjLbQ-ulh-KcgAxwrrERgTF9y1VO5Q8YMrHnNlHfYOFRFsIUB--owB9n7U4EHvHb0ii2_mJ-AUGqkqPqddXwSB2V6QoLQuvhmLSh0riAXkk0IYjQ-PPC0TqztE6YpNG323GMZSIb8rQZVitMb9FciYpMuYZ9cZWRPNg4r9V_vqkNC0LHYVIRYjBEl7CyY3DrjDvS1EbcfG7lPepQgPR6VpvapupttalJPrgzPJlqkRpTwiy8fPnw-R_40uWJycQwO77aSubhCJfeK6eb3071v2Ggw56fWuhyKygde3JjrX3AOYFxXGRsajXyxQkNEosBsRpn_SGc-trWu-a2jSnSeu1VAWeuyYaGyTLJFay_vlUgNDUoamTXfQsfvZkzOhSepPTW48uqa5hTwQKZevqEi7wUze1ffY_yJ1tTDwkHcFJd_yVatzS5ORZ1kMWYzgheicovh07QEnnuTR2eJq9QjWcf92-dzs66D6DoE7fRNfLWUdC34qtZhtAJH_ExCAxFmMhsp5fn3robOldd4Nm9xykvM8Fkzrv48YWfefDYd9CeI8zlTHVro1jovo9o0ImqlPUPCMoIRAMyrLJRDkWQBsHTESOMGkVS0Jq8NZzytK3DQX2qAMpAjreDEx7iGMlRpv2uoH6rrH3y4_kAaNtBLnCUjWeTMzZODQ7uK-1V7sQsdIfdKqU_xAeTlj_LNFcZm1Uwf5QsXQR8La72x5gFXXgDDa3VYEvp8rQ17rQiMrPompJAGWHG2ZWzENssKtGsvhqaoHuTZoazuMHEY8HPc2ivGxeZZRDa-oSfoSZjXE-zKaJxykF42bGmXtfVo9RRMA52T-wao6j-IINvaAwrBMyRJ4H8BBQ-IS45dVM6Znq1kSKE-_DeiFqAia3JRgxVzeS3cswgnM4eCjRrb7OUfMCZKUKEh58yLp58t4WP7sL7TCPC71zW4LAmC9Yv2NWocKpolpvH1vGOUqWpWwNhwqarTUKgvsRv58RDn6yxMMnefPssIfxJsDYuZ00FKsdJuXc4hPSJYqgZYDdwlbpIOhyl8UdHeylu5An8d7htNbBMRwwx7iV0dreuSWml7sx0hHc7-yCszYDXmnoNbE6y3GMxmQtB_zIYk91NY8DfNCa4L1yxmtzeAWPadEkhrvtqNg02_lqIiMsuWhGRA%3D%3D'
}];

let db = new sqlite3.Database('banco.db', (err) => {
    if (err)
        console.error(err.message);
    console.log('Bando de Dados OK!');
});

const token = '1629078447:AAEabyJw0rTTyv_V-JzzaG051KcOt38kJeI';
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
                const videoMP4 = 'http://adf.ly/16408729/https://jhlks.github.io/goto/?ref=' + base64(info.videoUrlHigh);
                const NovaPontuacao = Usuario[0]['Pontos'] - 1;
                await UpdateUser('Pontos', NovaPontuacao, UserId);
                bot.sendPhoto(msg.from.id, info.mozaique, { caption: `${info.title} \n\nPontos restantes: ${NovaPontuacao}`, reply_markup: { inline_keyboard: [[{text: 'Assistir Vídeo', url: `${videoMP4}` }]]}});
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
            bot.sendMessage(ChatId, `Bem Vindo ${UserName} \n\nEnvie um link do video, do Xvideos Red, Que eu vou usar seus pontos para te enviar o vídeo. \n Se você não tem pontos use (/convidar) para ganhar mais ponto grátis.`);
        } else {
            bot.sendMessage(ChatId, `Olá Novamente ${Usuario[0]['Nome']} \n\nEnvie um link do video, do Xvideos Red, Que eu vou usar seus pontos para te enviar o vídeo.`);
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
        bot.sendMessage(ChatId, `Convide para ganhar pontos! \nA cada amigo que acessa seu link de convite, você ganha 2 pontos! \nSeu Link de convite: https://t.me/xlxvideosredbot?start=${UserId} \n✨ Mande para seus amigos e ganhe pontos grátis! \n\n❕ Os postos servem para você poder usar o bot.`, { parse_mode: 'HTML' })
    } else if ( str === '/pontos' ) {
        const Usuario = await searchUserById(UserId);
        bot.sendMessage(ChatId, `Pontos: ${Usuario[0]['Pontos']} \n👥 ${Usuario[0]['Referencia']} Pessoas usaram seu link de convite \n\n❕ Ganhe pontos convidando amigos (/convidar)`);
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
            await main.goto('https://www.xvideos.red/video' + Video + '/', { waitUntil: 'load', timeout: 0 });
            //delete old cookies
            const client = await main.target().createCDPSession();
            await await client.send('Network.clearBrowserCookies');
            //set new cookies
            await main.setCookie(...cookies);
            const cookiesSet = await main.cookies('https://www.xvideos.red/');
            //go to page video
            await main.goto('https://www.xvideos.red/video' + Video + '/', { waitUntil: 'load', timeout: 0 });
            await main.waitForSelector('.page-title');

            var html = await main.evaluate(function() {
                return document.getElementsByTagName('html')[0].innerHTML;
            });

            var Title = Getstring(html, "setVideoTitle(", ");");
            var Mozaique = Getstring(html, "setThumbSlideBig(", ");");
            var VideoUrlHigh = Getstring(html, "setVideoUrlHigh(", ");");
            var VideoHLS = Getstring(html, "setVideoHLS(", ");");
            var Thumb = Getstring(html, "setThumbUrl169(", ");");
            
            video.title = Title.substring(2 , Title.length -2);
            video.mozaique = Mozaique.substring(2 , Mozaique.length -2);
            video.videoUrlHigh = VideoUrlHigh.substring(2 , VideoUrlHigh.length -2);
            video.videoHLS = VideoHLS.substring(2 , VideoHLS.length -2);
            video.thumb = Thumb.substring(2 , Thumb.length -2);

            if(video) {
                resolve(video);
                await browser.close();
            } else {
                reject('Falha');
                await browser.close();
            }

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
