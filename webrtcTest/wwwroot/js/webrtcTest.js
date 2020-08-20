"use strict";

var peerjsConnected = false;
var signalrConnected = false;
var streamGotten = false;
var PeerID = "";
const videoGrid = document.getElementById('video-grid');
const mVideo = document.createElement('video');
mVideo.muted = true;

var peers = {};
var myStream = {};

var streams = {};

var connection = new signalR.HubConnectionBuilder().withUrl("/testhub").build();

connection.on("userconnected", function (userid) {
    console.log("user connected : " + userid);

    setTimeout(function () { connectToNewUser(userid, myStream); }, 5000);
    
});

connection.on("userdisconnected", function (userid) {
    console.log("user disconnected : " + userid);
    if (peers[userid].call) {
        peers[userid].call.close();
        peers[userid].remove();
    }
});

connection.start().then(function () {
    console.log("connected!");
    signalrConnected = true;

    if (peerjsConnected && signalrConnected && streamGotten) {
        connection.invoke("joinroom", ROOM_ID, PeerID).catch(function (err) {
            return console.error(err.toString());
        });
    }
}).catch(function (err) {
    return console.error(err.toString());
});

const myPeer = new Peer(undefined, {
    host: 'localhost',
    port: 9000,
    path: '/myapp',
    secure: false
});


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(mVideo, stream);
    myStream = stream;
    streamGotten = true;

    if (peerjsConnected && signalrConnected && streamGotten) {
        connection.invoke("joinroom", ROOM_ID, PeerID).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

myPeer.on('call', call => {
    console.log("called. Answering");
    call.answer(myStream);
    console.log("Answered.");

    var uVideo = document.createElement('video');
    uVideo.muted = true;

    call.on('stream', uvstream => {
        console.log("user connecting");
        console.log(uvstream);

        if (!streams[uvstream.id]) {
            streams[uvstream.id] = uvstream;
            addVideoStream(uVideo, uvstream);
        }
    });
});

myPeer.on('open', peerid => {
    PeerID = peerid;
    peerjsConnected = true;

    if (peerjsConnected && signalrConnected && streamGotten) {
        connection.invoke("joinroom", ROOM_ID, PeerID).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

function connectToNewUser(userid, stream) {
    console.log("Trying to call user : " + userid);
    var call = myPeer.call(userid, stream);

    console.log("Called user : " + call);

    var uVideo = document.createElement('video');
    uVideo.muted = true;

    call.on('stream', uservideostream => {
        console.log("Call successful. Displaying");

        //if (!peers[call.peer].stream) {
        //    peers[call.peer].stream = uservideostream;
        //}

        if (!streams[uservideostream.id]) {
            streams[uservideostream.id] = uservideostream;
            addVideoStream(uVideo, uservideostream);
        }
    });

    call.on('close', () => {
        console.log("Stream closed");
        uVideo.remove();
    });

    if (!peers[userid]) {
        peers[userid] = {}
    }

    peers[userid].call = call;
}

var count = 0;

function addVideoStream(video, stream) {
    count++;
    console.log("displaying video stream " + count);

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);

    console.log("displayed video stream " + count);
}
