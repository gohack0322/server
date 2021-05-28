<template>
    <img alt="Vue logo" src="./assets/logo.png">
    {{ character }}
    {{ peers.getLength() }}
    <section class="make-center">
    <div>
      <label><input type="checkbox" id="record-entire-conference"> Record Entire Conference In The Browser?</label>
      <span id="recording-status" style="display: none;"></span>
      <button id="btn-stop-recording" style="display: none;">Stop Recording</button>
      <br><br>

      <input type="text" id="room-id" value="abcdef" autocorrect=off autocapitalize=off size=20>
      <button id="open-room">Open Room</button>
      <button id="join-room">Join Room</button>
      <button id="open-or-join-room">Auto Open Or Join Room</button>
    </div>

    <div id="videos-container" style="margin: 20px 0;"></div>

    <div id="room-urls" style="text-align: center;display: none;background: #F1EDED;margin: 15px -10px;border: 1px solid rgb(189, 189, 189);border-left: 0;border-right: 0;"></div>
  </section>
</template>

<script>
import { onMounted, reactive } from 'vue'
import { Client } from '@utils/socket'
import getHTMLMediaElement from '@utils/getHTMLMediaElement'

console.log(Client, getHTMLMediaElement)
window.Client = Client

Client.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

// STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
// via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
var bitrates = 512;
var resolutions = 'Ultra-HD';
var videoConstraints = {};

if (resolutions == 'HD') {
    videoConstraints = {
        width: {
            ideal: 1280
        },
        height: {
            ideal: 720
        },
        frameRate: 30
    };
}

if (resolutions == 'Ultra-HD') {
    videoConstraints = {
        width: {
            ideal: 1920
        },
        height: {
            ideal: 1080
        },
        frameRate: 30
    };
}

Client.mediaConstraints = {
    video: videoConstraints,
    audio: true
};

var CodecsHandler = Client.CodecsHandler;

Client.processSdp = function(sdp) {
    var codecs = 'vp8';
    
    if (codecs.length) {
        sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
    }

    if (resolutions == 'HD') {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
            audio: 128,
            video: bitrates,
            screen: bitrates
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: bitrates * 8 * 1024,
            max: bitrates * 8 * 1024,
        });
    }

    if (resolutions == 'Ultra-HD') {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
            audio: 128,
            video: bitrates,
            screen: bitrates
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: bitrates * 8 * 1024,
            max: bitrates * 8 * 1024,
        });
    }

    return sdp;
};
// END_FIX_VIDEO_AUTO_PAUSE_ISSUES

// https://www.rtcmulticonnection.org/docs/iceServers/
// use your own TURN-server here!
Client.iceServers = [{
    'urls': [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
    ]
}];

export default {
    name: 'App',
    setup() {
        const random = max => Math.floor(Math.random() * max)

        let id = random(100)
        const character = reactive({
            id: id,
            level: random(100),
            name: '',
            gender: '',
            avatar: '',
            image: '',
            map_id: 2,
            user_id: '',
            status: ''
        })

        const disableInputButtons = (enable) => {
            // document.getElementById('room-id').onkeyup();

            // document.getElementById('open-or-join-room').disabled = !enable;
            // document.getElementById('open-room').disabled = !enable;
            // document.getElementById('join-room').disabled = !enable;
            // document.getElementById('room-id').disabled = !enable;
        }

        const showRoomURL = (roomid) => {
            var roomHashURL = '#' + roomid;
            var roomQueryStringURL = '?roomid=' + roomid;

            var html = '<h2>Unique URL for your room:</h2><br>';

            html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
            html += '<br>';
            html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';

            var roomURLsDiv = document.getElementById('room-urls');
            roomURLsDiv.innerHTML = html;

            roomURLsDiv.style.display = 'block';
        }
console.log(document)

        const onStream = event => {
            console.log('onStream', event)
            var existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            event.mediaElement.removeAttribute('src');
            event.mediaElement.removeAttribute('srcObject');
            event.mediaElement.muted = true;
            event.mediaElement.volume = 0;

            var video = document.createElement('video');
            console.log('onSteam', video)

            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }
            console.log('onSteam', video)

            if (event.type === 'local') {
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }
            }
            console.log('onSteam', video.srcObject, event.stream)
            try {
            video.srcObject = event.stream;
            } catch(e) {
            console.error('onSteam', video.srcObject, event.stream)
            }
            var width = parseInt(Client.videosContainer.clientWidth / 3) - 20;
            console.log('onSteam', width)
            console.log('onSteam', getHTMLMediaElement)
            var mediaElement = getHTMLMediaElement(video, {
                title: event.userid,
                buttons: ['full-screen'],
                width: width,
                showOnMouseEnter: false
            });
            console.log('onSteam', mediaElement, width)

            Client.videosContainer.appendChild(mediaElement);

            setTimeout(function() {
                mediaElement.media.play();
            }, 5000);

            mediaElement.id = event.streamid;

            // to keep room-id in cache
            localStorage.setItem(Client.socketMessageEvent, Client.sessionid);

            chkRecordConference.parentNode.style.display = 'none';

            if(chkRecordConference.checked === true) {
            btnStopRecording.style.display = 'inline-block';
            recordingStatus.style.display = 'inline-block';

            var recorder = Client.recorder;
            if(!recorder) {
                recorder = RecordRTC([event.stream], {
                type: 'video'
                });
                recorder.startRecording();
                Client.recorder = recorder;
            }
            else {
                recorder.getInternalRecorder().addStreams([event.stream]);
            }

            if(!Client.recorder.streams) {
                Client.recorder.streams = [];
            }

            Client.recorder.streams.push(event.stream);
            recordingStatus.innerHTML = 'Recording ' + Client.recorder.streams.length + ' streams';
            }

            if(event.type === 'local') {
                Client.socket.on('disconnect', function() {
                    if(!Client.getAllParticipants().length) {
                        location.reload();
                    }
                });
            }
        }
onMounted(() => {
    document.getElementById('open-room').onclick = function() {
        disableInputButtons();
        Client.open(document.getElementById('room-id').value, function(isRoomOpened, roomid, error) {
            if(isRoomOpened === true) {
            showRoomURL(Client.sessionid);
            }
            else {
            disableInputButtons(true);
            if(error === 'Room not available') {
                alert('Someone already created this room. Please either join or create a separate room.');
                return;
            }
            alert(error);
            }
        });
    };

    document.getElementById('join-room').onclick = function() {
        disableInputButtons();
        Client.join(document.getElementById('room-id').value, function(isJoinedRoom, roomid, error) {
        if (error) {
                disableInputButtons(true);
                if(error === 'Room not available') {
                alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                return;
                }
                alert(error);
            }
        });
    };

    document.getElementById('open-or-join-room').onclick = function() {
        disableInputButtons();
        Client.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid, error) {
            if(error) {
            disableInputButtons(true);
            alert(error);
            }
            else if (Client.isInitiator === true) {
                // if room doesn't exist, it means that current user will create the room
                showRoomURL(roomid);
            }
        });
    }
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    // while (match = r.exec(search.substring(1))) {
    //     params[d(match[1])] = d(match[2]);
    // }
    window.params = params;

    var roomid = '';
    if (localStorage.getItem(Client.socketMessageEvent)) {
        roomid = localStorage.getItem(Client.socketMessageEvent);
    } else {
        roomid = Client.token();
    }

    var txtRoomId = document.getElementById('room-id');
    txtRoomId.value = roomid;
    txtRoomId.onkeyup = txtRoomId.oninput = txtRoomId.onpaste = function() {
        localStorage.setItem(Client.socketMessageEvent, document.getElementById('room-id').value);
    };

    var hashString = location.hash.replace('#', '');
    if (hashString.length && hashString.indexOf('comment-') == 0) {
        hashString = '';
    }

    roomid = params.roomid;
    if (!roomid && hashString.length) {
        roomid = hashString;
    }

    if (roomid && roomid.length) {
        document.getElementById('room-id').value = roomid;
        localStorage.setItem(Client.socketMessageEvent, roomid);

        // auto-join-room
        (function reCheckRoomPresence() {
            Client.checkPresence(roomid, function(isRoomExist) {
                if (isRoomExist) {
                    Client.join(roomid);
                    return;
                }

                setTimeout(reCheckRoomPresence, 5000);
            });
        })();

        disableInputButtons();
    }

    // detect 2G
    if(navigator.connection &&
    navigator.connection.type === 'cellular' &&
    navigator.connection.downlinkMax <= 0.115) {
    alert('2G is not supported. Please use a better internet service.');
    }

        Client.userid = id
        Client.extra = character
        // Client.updateExtraData()
        // Client.openOrJoin(character.map_id, (param1,param2,param3) => console.log(param1,param2,param3))
        Client.videosContainer = document.getElementById('videos-container')
        Client.onstream = onStream
})

        return {
            character,
            peers: Client.peers
        }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
