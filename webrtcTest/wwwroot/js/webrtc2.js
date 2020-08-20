
var signalrConnected = false;
var streamGotten = false;

var myStream = {};
var myWebrtcData = "";
var myJoiningPeer = {};
var myId = "";

var peers = {};

var lastUserId = "";

const videoGrid = document.getElementById('video-grid');
const mVideo = document.createElement('video');
mVideo.muted = true;

var connection = new signalR.HubConnectionBuilder().withUrl("/testhub").build();

connection.on("userconnected", function (userid) {
    console.log("user connected : " + userid);

    connectToNewUser(userid, myStream);
});

connection.on("firstperson", function (userid) {
    createJoiningPeer(userid);
});

connection.on("notfirstperson", function (userid) {
    createJoiningPeer(userid);
    createCallingPeer(userid);
});

connection.on("answercall", function (userid, conndata) {
    answercall(userid, conndata);

});

connection.on("userdisconnected", function (userid) {
    console.log("user disconnected : " + userid);
});

connection.start().then(function () {
    console.log("connected!");
    signalrConnected = true;

    if (signalrConnected && streamGotten) {
        joinRoom();
    }
}).catch(function (err) {
    return console.error(err.toString());
});


navigator.getUserMedia({ video: true, audio: false }, function (stream) {
    addVideoStream(mVideo, stream);
    myStream = stream;
    streamGotten = true;

    if (signalrConnected && streamGotten) {
        joinRoom();
    }

}, function (err) {
    console.error(err);
});

function createJoiningPeer(userid) {
    var peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: myStream
    });

    peer.on('signal', function (data) {
        if (!myWebrtcData) {
            myWebrtcData = JSON.stringify(data);
        }
    });

    peer.on('stream', function (stream) {
        var uVideo = document.createElement('video');
        uVideo.muted = true;

        addVideoStream(uVideo, stream);
    });

    myJoiningPeer = peer;
    myId = userid;
}


function createCallingPeer(userid) {
    var peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: myStream
    });

    peer.on('signal', function (data) {
        startCall(ROOM_ID, JSON.stringify(data));
    });

    peer.on('stream', function (stream) {
        var uVideo = document.createElement('video');
        uVideo.muted = true;

        addVideoStream(uVideo, stream);
    });

    myJoiningPeer = peer;
    myId = userid;
}

function joinRoom() {
    connection.invoke("joinroom", ROOM_ID).catch(function (err) {
        return console.error(err.toString());
    });
}

function startCall(roomid, myconn) {
    connection.invoke("startcall", roomid, myconn).catch(function (err) {
        return console.error(err.toString());
    });
}

function answercall(userid, userconn) {
    myJoiningPeer.signal(JSON.parse(userconn));
}

var count = 0;

function addVideoStream(video, stream) {
    count++;
    console.log("displaying video stream " + count);

    video.srcObject = stream;
    videoGrid.append(video);

    video.play();

    console.log("displayed video stream " + count);
}

//function connectToNewUser(userid, connData) {
//    console.log("Trying to call user : " + userid);

//    lastUserId = userid;
//    peer.signal(connData);

//    console.log("Called user : " + userId);

//}
