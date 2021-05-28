<template>
    <div>
        <div style="text-align:left;position:fixed;left:1rem;top:1rem;">
            <div>麥克風：{{ hasMicro ? '可使用' : '無法使用' }}，權限：{{ isMicroPermission ? 'true' : 'false' }}</div>
            <div>鏡頭：{{ hasCam ? '可使用' : '無法使用' }}，權限：{{ isCamPermission ? 'true' : 'false' }}</div>
            <div>ID:{{ character.id }}</div>
            <div>level:{{ character.level }}</div>
            <div>name:{{ character.name }}</div>
            <div>{{ Client.getAllParticipants().length }}</div>
            <div>{{ users.list }}</div>
        </div>
        <section class="make-center">
            <div>
                <input type="text" id="room-id" value="abcdef" autocorrect=off autocapitalize=off size=20>
                <button id="open-room">Open Room</button>
                <button id="join-room">Join Room</button>
                <button id="open-or-join-room">Auto Open Or Join Room</button>
            </div>

            <div id="videos-container" style="margin: 20px 0;"></div>
        </section>
    </div>
</template>

<script>
import { onMounted, reactive, watch, ref, toRefs, toRef } from 'vue'
import { Client } from '@utils/socket'

window.Client = Client

export default {
    name: 'App',
    setup() {
        let hasMicro = ref(Client.DetectRTC.hasMicrophone)
        let hasCam = ref(Client.DetectRTC.hasWebcam)
        let isMicroPermission = ref(Client.DetectRTC.isWebsiteHasMicrophonePermissions)
        let isCamPermission = ref(Client.DetectRTC.isWebsiteHasWebcamPermissions)
        const random = max => Math.floor(Math.random() * max)
        const users = reactive({ list: [] })

        let id = random(100)
        const character = {
            id: id,
            level: random(100),
            name: '',
            gender: '',
            avatar: '',
            image: '',
            map_id: 2,
            user_id: '',
            status: ''
        }

        const onStream = event => {
            console.log('onStream', event)
            var existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            // event.mediaElement.removeAttribute('src');
            // event.mediaElement.removeAttribute('srcObject');
            // event.mediaElement.muted = true;
            // event.mediaElement.volume = 0;

            var video = document.createElement('video');

            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }

            if (event.type === 'local') {
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }
            }

            video.srcObject = event.stream
            video.style.width = '200px'
            video.style.height = '120px'
            video.style.position = 'relative'
            video.id = event.streamid

            Client.videosContainer.appendChild(video)

            if(event.type === 'local') {
                Client.socket.on('disconnect', function() {
                    if (!Client.getAllParticipants().length) {
                        location.reload();
                    }
                });
            }
            Client.onUserStatusChanged(event)
        }

        const onStreamed = event => {
            console.log('onStreamed', event)
            var video = document.getElementById(event.streamid);
            // if (!video) {
            //     video = document.getElementById(event.streamid);
            //     if (video) {
            //         video.parentNode.removeChild(video);
            //         return;
            //     }
            // }
            if (video) {
                video.srcObject = null;
                video.style.display = 'none';
                video.remove()
            }
        }

        onMounted(() => {
            document.getElementById('open-room').onclick = function() {
                Client.open(document.getElementById('room-id').value, function(isRoomOpened, roomid, error) {
                    if (isRoomOpened === false) {
                        if(error === 'Room not available') {
                            alert('Someone already created this room. Please either join or create a separate room.');
                            return;
                        }
                        alert(error);
                    }
                });
            };

            document.getElementById('join-room').onclick = function() {
                Client.join(document.getElementById('room-id').value, function(isJoinedRoom, roomid, error) {
                if (error) {
                        if(error === 'Room not available') {
                        alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                        return;
                        }
                        alert(error);
                    }
                });
            };

            document.getElementById('open-or-join-room').onclick = function() {
                Client.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid, error) {
                    if(error) {
                        alert(error);
                    }
                    else if (Client.isInitiator === true) {
                        // if room doesn't exist, it means that current user will create the room
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
            }

            // detect 2G
            if(navigator.connection &&
            navigator.connection.type === 'cellular' &&
            navigator.connection.downlinkMax <= 0.115) {
            alert('2G is not supported. Please use a better internet service.');
            }

            Client.onUserStatusChanged = event => {
                users.list = Client.getAllParticipants().map(u => Client.peers[u].extra)
                console.log('onUserStatusChanged', event, users.list, Client.getAllParticipants())
                // Client.getAllParticipants().forEach(pid =>  {
                //     users.list.push(Client.peers[pid].extra);
                // });

                // if (!users.list.length) {
                //     users.list = ['Only You'];
                // } else {
                //     users.list = [Client.extra.userFullName || 'You'].concat(users.list);
                // }
            }

            Client.DetectRTC.load(() => {
                hasMicro.value = Client.DetectRTC.hasMicrophone
                hasCam.value = Client.DetectRTC.hasWebcam
                isMicroPermission.value = Client.DetectRTC.isWebsiteHasMicrophonePermissions
                isCamPermission.value = Client.DetectRTC.isWebsiteHasWebcamPermissions
            })

            Client.userid = id
            Client.extra = character
            // Client.updateExtraData()
            // Client.openOrJoin(character.map_id, (param1,param2,param3) => console.log(param1,param2,param3))
            Client.videosContainer = document.getElementById('videos-container')
            Client.onstream = onStream
            Client.onstreamended = onStreamed
        })

        return {
            character,
            Client,
            users,

            hasMicro,
            hasCam,
            isMicroPermission,
            isCamPermission
        }
    },
    created() {
        window.vue = this
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
