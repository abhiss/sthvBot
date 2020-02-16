"use strict";
exports.__esModule = true;
var http = require("http");
//@ts-check
/// <reference path="node_modules/discord.js/typings/index.d.ts" />
var fs = require('fs');
var Discord = require('discord.js');
var client = new Discord.Client();
var sthGuild = client.guilds.find(function (g) { return g.id == 'Survive the Hunt'; }); //only here for types and intellisense to work, set properly in on ready event. sthGuild remains null here. 
client.on('ready', function () {
    // console.log('----guilds----')
    // client.guilds.forEach(elm => console.log(elm.name + ' ' + elm.id))
    // console.log('--------------')
    sthGuild = client.guilds.find(function (g) { return g.name == 'Survive the Hunt'; });
    //defs
    //betaGuild = client.guilds.find(function (g) { return g.id == '661330929985257532';})
    console.log('logged in as ' + client.user.tag);
    //hLog(sthvGuild.owner)
    console.log('Active in: ' + sthGuild.name);
});
client.on('message', function (message) {
    var msgText = message.content;
    var msg = msgText.split(' ');
    if (msgText == 'ping') {
        message.guild.channels.forEach(function (elm) { return console.log(elm); });
        message.reply('pong');
    }
    else if (msg[0] == '-vc') {
        var pc_voice = sthGuild.channels.find(function (ch) { return ch.name == 'pc-voice'; });
    }
    else if (msg[0] == '-id') {
        if (msg[1]) {
            var memid = getMemberFromId(msg[1]).id;
        }
    }
    else if (msg[0] == '-gm') {
        message.reply(sthGuild.members.size);
    }
    else if (msgText[0] == '>') {
        if (message.author.id == '661327633602314290') {
            eval(msgText.substr(1));
        }
    }
});
function getMembersInVoiceChannel(channelName) {
    try {
        var channel = getChannelFromName(channelName);
        var memArray_1 = [];
        console.log(channel.members);
        channel.members.forEach(function (element) {
            memArray_1.push(element.id);
        });
        return memArray_1;
    }
    catch (err) {
        console.log('error in getMembersInVoiceChannel: ' + err);
        hLog('error in getMembersInVoiceChannel: ' + err);
    }
}
/**
 * @param {string} searchId - id of member to be found
 * @returns {GuildMember} Member
 */
function getMemberFromId(searchId) {
    try {
        var res = sthGuild.members.find(function (mem) { return mem.id == searchId; });
        return res;
    }
    catch (err) {
        console.log(err);
        hLog('error in getMemberFromId looking for id: ' + searchId);
        hLog(err);
    }
}
function hLog(message) {
    try {
        if (message.length > 0) {
            sthGuild.channels.find(function (ch) { return ch.name == 'bot-logs'; }).send(message);
        }
        else {
            sthGuild.channels.find(function (ch) { return ch.name == 'bot-logs'; }).send('an empty message was attempted to log');
        }
    }
    catch (er) {
        console.log("Error in hLog function: ", er, 'message was ' + message);
    }
}
function getChannelFromName(name) {
    var channel = sthGuild.channels.find(function (ch) { return ch.name == name; });
    if (channel)
        return channel;
    else {
        console.error('channel not found in getChannelFromName: ' + name);
        return null;
    }
}
function moveMemberToVc(memberid, channelname) {
    if (!!sthGuild.channels.find(function (ch) { return ch.name == channelname; })) {
        console.log(channelname + ' exists');
        try {
            getMemberFromId(memberid).setVoiceChannel(getChannelFromName(channelname))["catch"](function (reason) {
                console.log(reason);
                hLog('moveMemberToVc failed because member wasnt in a vc:`' + reason);
                return false;
            });
            return getMembersInVoiceChannel(channelname).includes(memberid);
        }
        catch (err) {
            console.log(err);
            hLog("tried moving memberid " + memberid + " to channel " + channelname);
            hLog(err);
            return false;
        }
    }
    else {
        hLog(channelname + ' isnt a channelname [moveMemberToVc]');
    }
}
/**
 * @param id member's id
 * @returns {MemberInGuildResult}
 */
function GetIsMemberInGuild(id) {
    return !!sthGuild.members.find(function (mem) { return mem.id == id; });
}
function RequestHandler(body) {
    if (body.name) {
        switch (body.name) {
            case 'GetPlayersInChannel':
                if (body.data.channel) {
                    return getMembersInVoiceChannel(body.data.channel);
                }
                break;
            case 'GetIsPlayerInGuild':
                if (body.data.id)
                    return GetIsMemberInGuild(body.data.id);
                break;
            case 'MovePlayerToVc':
                if (body.data.id && body.data.channel) {
                    return moveMemberToVc(body.data.id, body.data.channel);
                }
            case '':
            default:
                hLog('`request had invalid name of` ' + body.name);
                break;
        }
    }
}
fs.readFile(__dirname + '\\botLogin', 'utf-8', function (err, data) {
    if (err)
        throw err;
    else {
        client.login(data);
    }
});
var PORT = 3000;
var server = http.createServer(function (req, res) {
    if (req.headers['sthvServerId'] == 'oMTdy7asWk') {
        console.log('official server!');
    }
    else {
        console.log(req.headers);
    }
    var body = [];
    if (req.method == 'POST') {
        req
            .on('error', function (err) {
            console.log('error in server listener: ' + err);
            hLog('error in discord listener: ' + err);
        })
            .on('data', function (data) {
            body.push(data);
        })
            .on('end', function () {
            var finalBuffer = Buffer.concat(body).toString();
            //console.log(finalBuffer);
            var resContent = RequestHandler(JSON.parse(finalBuffer));
            //console.log(resContent);
            if (resContent)
                res.statusCode = 200;
            else
                res.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(resContent));
            res.end();
        })
            .on('close', function () {
            console.log("connect closed");
        });
    }
});
server.listen(3000);
console.log('listening at port ' + PORT);
//# sourceMappingURL=discordLogin.js.map