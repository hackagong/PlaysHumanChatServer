var irc = require("tmi.js"); // Do not include this line if included in HTML page
var osc = require('node-osc');


var hphConfig = {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD,
    oscServerIP: process.env.OSC_IP,
    oscServerPort: process.env.OSC_PORT,

    commandCharLimit: 10
};

var cOptions = {
    options: {
        debug: true
    },
    connection: {
        random: "chat",
        reconnect: true
    },
    identity: {
        username: hphConfig.username,
        password: hphConfig.password
    },
    channels: ["#"+hphConfig.username]
};

var wOptions = {
    options: {
        debug: true
    },
    connection: {
        random: "group",
        reconnect: true
    },
    identity: {
        username: hphConfig.username,
        password: hphConfig.password
    },
    channels: ["#"+hphConfig.username]
};

var chatClient = new irc.client(cOptions);
var whisperClient = new irc.client(wOptions);
var oscClient = new osc.Client(hphConfig.oscServerIP, hphConfig.oscServerPort);

var chatMessages = [];

// Connect the client to the server..
chatClient.connect();
whisperClient.connect();

chatClient.on("chat", function(channel, user, message, self) {
    // Make sure the message is not from the bot..
    if (!self && message[0] == '!') {
        var chat = [channel, user, message];
        chatMessages.push(chat);
    }
});

setInterval(function()
{
    if (chatMessages.length > 0) {
        var rand = Math.floor(Math.random()*chatMessages.length),
            msgArr = chatMessages[rand];
            msg  = msgArr[2].slice(1);
            msgObj = msgArr[1];

        console.log('total msgs: '+chatMessages.length+',username: '+msgObj.username+', command:'+msg);

        if (msg.length > hphConfig.commandCharLimit) {
            whisperClient.whisper(msgObj.username, 'Commands need to be 10 charactes or less');
        } else {
            oscClient.send('/command', msg.toUpperCase());
        }
        chatMessages = [];
    }
}, 5000);