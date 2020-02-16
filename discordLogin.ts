import { Message, GuildMember, Guild, TextChannel, VoiceChannel, StreamDispatcher } from "discord.js";
import * as http from "http";
import { Http2ServerRequest } from "http2";
//@ts-check
/// <reference path="node_modules/discord.js/typings/index.d.ts" />

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();


let sthGuild: Guild = client.guilds.find(function (g) { return g.id == 'Survive the Hunt'; }) //only here for types and intellisense to work, set properly in on ready event. sthGuild remains null here. 
client.on('ready', function () {
    // console.log('----guilds----')
    // client.guilds.forEach(elm => console.log(elm.name + ' ' + elm.id))
    // console.log('--------------')
    sthGuild = client.guilds.find(function (g) { return g.name == 'Survive the Hunt'; })
    //defs

    //betaGuild = client.guilds.find(function (g) { return g.id == '661330929985257532';})

    console.log('logged in as ' + client.user.tag);

    //hLog(sthvGuild.owner)
    console.log('Active in: ' + sthGuild.name);
});


client.on('message', function (message: Message) {
    var msgText = message.content;
    var msg = msgText.split(' ');
    if (msgText == 'ping') {
        message.guild.channels.forEach(function (elm) { return console.log(elm); });
        message.reply('pong');
    }
    else if (msg[0] == '-vc') {
        let pc_voice = sthGuild.channels.find(ch => ch.name == 'pc-voice')
    }
    else if (msg[0] == '-id') {
        if (msg[1]) {
            let memid = getMemberFromId(msg[1]).id
        }
    }
    else if(msg[0] == '-gm'){
        message.reply(sthGuild.members.size);
    }
    else if (msgText[0] == '>') {
        if (message.author.id == '661327633602314290') {
            eval(msgText.substr(1));
        }
    }

});

function getMembersInVoiceChannel(channelName: string) {
    try {
        let channel = getChannelFromName(channelName) as VoiceChannel;
        let memArray: Array<string> = [];
        console.log(channel.members)
        channel.members.forEach(element => {
            memArray.push(element.id);
        });
        return memArray
    }
    catch (err) {
        console.log('error in getMembersInVoiceChannel: ' + err)
        hLog('error in getMembersInVoiceChannel: ' + err);
    }
}
/**
 * @param {string} searchId - id of member to be found
 * @returns {GuildMember} Member 
 */
function getMemberFromId(searchId) {
    try {
        var res: GuildMember = sthGuild.members.find(mem => mem.id == searchId);
        return res;
    } catch (err) {
        console.log(err);
        hLog('error in getMemberFromId looking for id: ' + searchId)
        hLog(err);
    }
}
function hLog(message) {
    try {
        if (message.length > 0) {
            (sthGuild.channels.find(ch => ch.name == 'bot-logs') as TextChannel).send(message);
        }
        else {
            (sthGuild.channels.find(ch => ch.name == 'bot-logs') as TextChannel).send('an empty message was attempted to log');
        }
    }
    catch (er) {
        console.log("Error in hLog function: ", er, 'message was ' + message)
    }
}
function getChannelFromName(name: string) {
    let channel = sthGuild.channels.find(ch => ch.name == name)
    if (channel) return channel;
    else {
        console.error('channel not found in getChannelFromName: ' + name);
        return null;
    }
}
function moveMemberToVc(memberid: string, channelname: string) {
    if (!!sthGuild.channels.find(ch => ch.name == channelname)) {
        console.log(channelname + ' exists')
        try {
            getMemberFromId(memberid).setVoiceChannel(getChannelFromName(channelname)).catch(reason => {
                console.log(reason);
                hLog('moveMemberToVc failed because member wasnt in a vc:`' + reason)
                return false;
                
            });
            return getMembersInVoiceChannel(channelname).includes(memberid);
        }
        catch (err) {
            console.log(err);
            hLog(`tried moving memberid ${memberid} to channel ${channelname}`)
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
function GetIsMemberInGuild(id: string) {
    return !!sthGuild.members.find(mem => mem.id == id);
}

interface sthvRequest {
    name: string;
    data: any;
}
function RequestHandler(body: sthvRequest) {
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
                hLog('`request had invalid name of` ' + body.name)
                break;
        }
    }
}

fs.readFile(__dirname + '\\botLogin', 'utf-8', function (err, data) {
    if (err) throw err;
    else {
        client.login(data);
    }
});
const PORT = 3000;
const server = http.createServer(function (req , res) {
    if(req.headers['sthvServerId'] == 'oMTdy7asWk'){
        console.log('official server!')
    }
    else {
        console.log(req.headers)
    }
    let body = [];

    
    if (req.method == 'POST') {
        req
            .on('error', function (err) {
                console.log('error in server listener: ' + err);
                hLog('error in discord listener: ' + err);
            })
            .on('data', function (data) {
                body.push(data)
            })
            .on('end', function () {
                let finalBuffer = Buffer.concat(body).toString();
                //console.log(finalBuffer);

                const resContent = RequestHandler(JSON.parse(finalBuffer));
                //console.log(resContent);

                if (resContent) res.statusCode = 200;
                else res.statusCode
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(resContent))
                res.end();
            })
            .on('close', function () {
                console.log("connect closed")
            })
    }
});
server.listen(3000);
console.log('listening at port ' + PORT)
