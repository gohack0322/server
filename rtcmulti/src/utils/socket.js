// import ReconnectingWebSocket from 'reconnecting-websocket'
// import { emitter } from '@utils/event'
// import RTCMultiConnection from '@utils/rtcmulti'

// window.RTC = new RTCMultiConnection()
// const Client = new ReconnectingWebSocket('ws://localhost:3000/')

// const events = ['open', 'message', 'error', 'close']
// const types = {
//     login: 'login', // 登入初始化
//     logout: 'logout', // 登出角色
//     list: 'list', // 返回地圖內角色清單
//     info: 'info', // 角色狀態改變更新
//     chat: 'chat',
//     whisper: 'whisper',
//     error: 'error' // 資料發生錯誤
// }

// events.forEach(event => Client.addEventListener(event, args => {
//     if (event === 'message') {
//         emitter.emit('onSocket' + event.charAt(0).toUpperCase() + event.slice(1), JSON.parse(args.data))
//     } else {
//         emitter.emit('onSocket' + event.charAt(0).toUpperCase() + event.slice(1), args)
//     }
// }))

// const initClient = {
//     install: (app) => {
//         app.config.globalProperties.$client = Client
//     }
// }
// const send = (type, data) => Client.send(JSON.stringify({ type: type, ...data }))

// export { Client, send, types, initClient }
import RTCMultiConnection from '@utils/rtcmulti'
import { events, emitter } from '@utils/event'

const Client = new RTCMultiConnection()
window.RTCClient = Client
Client.socketURL = "https://www.gameproject.com:9001/"
// if you want audio+video conferencing
Client.session = {
    audio: true,
    video: true,
    data: true
}

Client.videosContainer = document.getElementById('videos-container')
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

Client.onstream = event => {
    // let video = event.mediaElement
    console.log('RTC onsrteam', event)
}

Client.onopen = event => {
    Client.onUserStatusChanged(event)
    console.log('onopen', event)
}
Client.onmessage = data => {
    emitter.emit(events.onSocketMessage, data)
    console.log('onmessage', data)
}
Client.onclose = Client.onerror = Client.onleave = event => {
    Client.onUserStatusChanged(event)
    console.log('onclose', event)
}
// Client.openOrJoin('your-room-id', data => {
//     console.log('openOrJoin', data)
//     emitter.emit(events.onSocketOpen)
// })

const types = {
    login: 'login', // 登入初始化
    logout: 'logout', // 登出角色
    list: 'list', // 返回地圖內角色清單
    info: 'info', // 角色狀態改變更新
    chat: 'chat',
    whisper: 'whisper',
    error: 'error' // 資料發生錯誤
}

const initClient = {
    install: (app) => {
        app.config.globalProperties.$client = Client
    }
}

const send = text => {
    Client.send(text)
}

export { Client, send, types, initClient }