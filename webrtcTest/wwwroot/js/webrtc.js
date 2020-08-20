var peer = {};
var lastuserid = "";

var getUserMedia = (
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.getUserMedia
);

navigator.getUserMedia({ video: true, audio: false }, function (stream) {

    const videoGrid = document.getElementById('video-grid');
    const mVideo = document.createElement('video');
    mVideo.muted = true;

    addVideoStream(mVideo, stream);

    var connection = new signalR.HubConnectionBuilder().withUrl("/testhub").build();

    connection.start().then(function () {
        console.log("connected!");

        connection.invoke("joinroom", ROOM_ID).catch(function (err) {
            return console.error(err.toString());
        });

    }).catch(function (err) {
        return console.error(err.toString());
    });

    connection.on("firstperson", function (userid) {
        console.log("I am first person " + userid);
        peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on('signal', function (data) {
            document.getElementById('yourid').value = JSON.stringify(data);

            console.log("First person was called");

            connection.invoke("answeringcall", lastuserid, JSON.stringify(data)).catch(function (err) {
                return console.error(err.toString());
            });

        });

        peer.on('data', function (data) {
            document.getElementById('messages').textContent += data + '\n';
        });

        peer.on('stream', function (stream) {

            console.log("First person has gotten stream");

            var video = document.createElement('video');
            //document.body.appendChild(video);

            //video.srcObject = stream;
            //video.play();

            addVideoStream(video, stream);
        });


    });

    connection.on("notfirstperson", function (userid) {

        console.log("Not first person " + userid);

        peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on('signal', function (data) {
            document.getElementById('yourid').value = JSON.stringify(data);

            console.log("Second person has gotten signal");

            connection.invoke("startcall", ROOM_ID, JSON.stringify(data)).catch(function (err) {
                return console.error(err.toString());
            });

        });

        peer.on('data', function (data) {
            document.getElementById('messages').textContent += data + '\n';
        });

        peer.on('stream', function (stream) {
            var video = document.createElement('video');

            console.log("Second person has gotten stream");

            //document.body.appendChild(video);

            //video.srcObject = stream;
            //video.play();

            addVideoStream(video, stream);
        });

    });

    connection.on("answercall", function (userid, conndata) {
        document.getElementById('otherid').value = conndata;
        var otherid = JSON.parse(conndata);
        lastuserid = userid;

        peer.signal(otherid);
    });

    connection.on("receivecall", function (conndata) {
        document.getElementById('otherid').value = conndata;
        var otherid = JSON.parse(conndata);

        peer.signal(otherid);
    });

    connection.on("userdisconnected", function (userid) {
        console.log("user disconnected : " + userid);
    });

    var count = 0;

    function addVideoStream(video, stream) {
        count++;
        console.log("displaying video stream " + count);

        videoGrid.append(video);
        video.srcObject = stream;

        video.play();

        console.log("displayed video stream " + count);
    }

    //document.getElementById('connect').addEventListener('click', function () {
        
    //});

    //document.getElementById('send').addEventListener('click', function () {
    //    var yourmessage = document.getElementById('yourmessage').value;
    //    peer.send(yourmessage);
    //});

}, function (err) {
    console.error(err);
});