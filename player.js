const fs = require('fs');
const { app, ipcMain, ipcRenderer, BrowserWindow, Menu } = require('electron');
fs.readdirSync(app.getAppPath());
const { finished } = require('stream');
const client = require('discord-rich-presence')('615959338942595092');
const os = require('os');
const path = require('path');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const api = express();
const port = 3000
var date = new Date();

var platform = os.platform()
if (platform == "win32") {
	platform = "win";
}

if (platform !== 'linux' && platform !== 'win') {
  console.error('Unsupported platform.', platform);
  process.exit(1)
}

var arch = os.arch()
if (arch !== 'x64') {
  console.error('Unsupported architecture.')
  process.exit(1)
}

var ffmpegPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'bin', platform, arch, platform === 'win' ? 'ffmpeg.exe' : 'ffmpeg');
console.log(ffmpegPath);

api.set('view engine', 'ejs');
api.set('views', path.join(__dirname, 'views'));
api.use(express.static(path.join(__dirname, 'public')))

let loginWindow;
let playerWindow;

let userData = app.getPath('userData');

if (!fs.existsSync(path.join(userData, 'temp'))) {
    fs.mkdirSync(path.join(userData, 'temp'));
};

function createPlayerWindow () {
    playerWindow = new BrowserWindow({ 
        width: 1600, 
        height: 900, 
        autoHideMenuBar: true, 
        webPreferences: {
            nodeIntegration: false, 
            preload: path.join(__dirname, 'preload.js')
        } 
    });

    playerWindow.loadURL('http://localhost:3000/');

    playerWindow.on('closed', function () {
        playerWindow = null
    })
}

ipcMain.on('updatePresence', (event, arg) => {
    var presence = {
        largeImageKey: 'logo_flat_large',
        instance: true,
    };

    if (arg.state) presence['state'] = arg.state;
    if (arg.details) presence['details'] = arg.details;
    if (arg.time) {
        presence['startTimestamp'] = Date.now();
        presence['endTimestamp'] = Date.now() + arg.time;
    }
    
    switch (arg.status) {
        case "playing":
            presence['smallImageKey'] = "play-1173551_960_720";
            presence['smallImageText'] = "Playing";
            break;
        case "paused": 
            presence['smallImageKey'] = "stop-1151625_960_720";
            presence['smallImageText'] = "Paused";
            break;
        default:
            //
    }

    try { client.updatePresence(presence); } 
    catch (err) { }
})

api.get('/', (req, res, next) => {
    res.render('index');
})

api.post('/search/:args', (req, res, next) => {
    var args = req.params.args;
    if (args == '' || args == undefined || args == null) return;

    ytSearch(args, function ( err, r ) {
        if ( err ) throw err
        
        const videos = r.videos
        const playlists = r.playlists
        const accounts = r.accounts
       
        res.json(videos);
    })
});

api.get('/api/video/info/:id', (req, res, next) => {
    var id = req.params.id;

    ytdl.getInfo(id, (err, info) => {
        if (err) {
            playerWindow.stop();
            throw err;
        }

        res.json(info);
    })
});

api.get('/api/download/:id', (req, res, next) => {
    var id = req.params.id;

    ytdl.getBasicInfo(id, (err, info) => {
        if (fs.existsSync(path.join(userData, 'temp', `${info.video_id}.mp3`))) {
            return res.sendFile(path.join(userData, 'temp', `${info.video_id}.mp3`));
        }   

        var proc = new ffmpeg({source: ytdl(info.video_url)});
        proc.setFfmpegPath(ffmpegPath);
        //proc.setFfmpegPath('/usr/bin/ffmpeg');
        proc.withAudioCodec('libmp3lame')
            .toFormat('mp3')
            .save(path.join(userData, 'temp', `${info.video_id}.mp3`));
        proc.on('end', function() {
            return res.sendFile(path.join(userData, 'temp', `${info.video_id}.mp3`))
        });

    })

});

api.listen(port, () => {  })
app.on('ready', createPlayerWindow);
