import { io } from 'socket.io-client'

export default class SocketConnection {
    constructor(rtcmulticonntection, connectCallback) {
        this.rtc = rtcmulticonntection

        this.alreadyConnected = false

        this.parameters = ''

        this.parameters += '?userid=' + this.rtc.userid;
        this.parameters += '&sessionid=' + this.rtc.sessionid;
        this.parameters += '&msgEvent=' + this.rtc.socketMessageEvent;
        this.parameters += '&socketCustomEvent=' + this.rtc.socketCustomEvent;
        this.parameters += '&autoCloseEntireSession=' + !!this.rtc.autoCloseEntireSession;

        if (this.rtc.session.broadcast === true) {
            this.parameters += '&oneToMany=true';
        }

        this.parameters += '&maxParticipantsAllowed=' + this.rtc.maxParticipantsAllowed;

        if (this.rtc.enableScalableBroadcast) {
            this.parameters += '&enableScalableBroadcast=true';
            this.parameters += '&maxRelayLimitPerUser=' + (this.rtc.maxRelayLimitPerUser || 2);
        }

        this.parameters += '&extra=' + JSON.stringify(this.rtc.extra || {});

        if (this.rtc.socketCustomParameters) {
            this.parameters += this.rtc.socketCustomParameters;
        }

        try {
            io.sockets = {};
        } catch (e) {};

        if (!this.rtc.socketURL) {
            this.rtc.socketURL = '/';
        }

        if (this.rtc.socketURL.substr(this.rtc.socketURL.length - 1, 1) != '/') {
            // this.rtc.socketURL = 'https://domain.com:9001/';
            throw '"socketURL" MUST end with a slash.';
        }

        if (this.rtc.enableLogs) {
            if (this.rtc.socketURL == '/') {
                console.info('socket.io url is: ', location.origin + '/');
            } else {
                console.info('socket.io url is: ', this.rtc.socketURL);
            }
        }

        try {
            this.rtc.socket = io(this.rtc.socketURL + this.parameters);
        } catch (e) {
            this.rtc.socket = io.connect(this.rtc.socketURL + this.parameters, this.rtc.socketOptions);
        }

        this.rtc.socket.on('extra-data-updated', (remoteUserId, extra) => {
            if (!this.rtc.peers[remoteUserId]) return;
            this.rtc.peers[remoteUserId].extra = extra;

            this.rtc.onExtraDataUpdated({
                userid: remoteUserId,
                extra: extra
            });

            this.updateExtraBackup(remoteUserId, extra);
        });

        this.rtc.socket.on(this.rtc.socketMessageEvent, this.onMessageEvent.bind(this));

        this.rtc.socket.resetProps = () => this.alreadyConnected = false

        this.rtc.socket.on('connect', () => {
            if (this.alreadyConnected) {
                return;
            }
            this.alreadyConnected = true;

            if (this.rtc.enableLogs) {
                console.info('socket.io connection is opened.');
            }

            setTimeout(() => {
                this.rtc.socket.emit('extra-data-updated', this.rtc.extra);
            }, 1000);

            if (connectCallback) {
                connectCallback(this.rtc.socket);
            }
        });

        this.rtc.socket.on('disconnect', event => {
            this.rtc.onSocketDisconnect(event);
        });

        this.rtc.socket.on('error', event => {
            this.rtc.onSocketError(event);
        });

        this.rtc.socket.on('user-disconnected', remoteUserId => {
            if (remoteUserId === this.rtc.userid) {
                return;
            }

            this.rtc.onUserStatusChanged({
                userid: remoteUserId,
                status: 'offline',
                extra: this.rtc.peers[remoteUserId] ? this.rtc.peers[remoteUserId].extra || {} : {}
            });

            this.rtc.deletePeer(remoteUserId);
        });

        this.rtc.socket.on('user-connected', userid => {
            if (userid === this.rtc.userid) {
                return;
            }

            this.rtc.onUserStatusChanged({
                userid: userid,
                status: 'online',
                extra: this.rtc.peers[userid] ? this.rtc.peers[userid].extra || {} : {}
            });
        });

        this.rtc.socket.on('closed-entire-session', (sessionid, extra) => {
            this.rtc.leave();
            this.rtc.onEntireSessionClosed({
                sessionid: sessionid,
                userid: sessionid,
                extra: extra
            });
        });

        this.rtc.socket.on('userid-already-taken', (useridAlreadyTaken, yourNewUserId) => {
            this.rtc.onUserIdAlreadyTaken(useridAlreadyTaken, yourNewUserId);
        });

        this.rtc.socket.on('logs', log => {
            if (!this.rtc.enableLogs) return;
            console.debug('server-logs', log);
        });

        this.rtc.socket.on('number-of-broadcast-viewers-updated', data => {
            this.rtc.onNumberOfBroadcastViewersUpdated(data);
        });

        this.rtc.socket.on('set-isInitiator-true', sessionid => {
            if (sessionid != this.rtc.sessionid) return;
            this.rtc.isInitiator = true;
        });
    }

    updateExtraBackup(remoteUserId, extra) {
        if (!this.rtc.peersBackup[remoteUserId]) {
            this.rtc.peersBackup[remoteUserId] = {
                userid: remoteUserId,
                extra: {}
            };
        }

        this.rtc.peersBackup[remoteUserId].extra = extra;
    }

    onMessageEvent(message) {
        if (message.remoteUserId != this.rtc.userid) return;

        if (this.rtc.peers[message.sender] && this.rtc.peers[message.sender].extra != message.message.extra) {
            this.rtc.peers[message.sender].extra = message.extra;
            this.rtc.onExtraDataUpdated({
                userid: message.sender,
                extra: message.extra
            });

            this.updateExtraBackup(message.sender, message.extra);
        }

        if (message.message.streamSyncNeeded && this.rtc.peers[message.sender]) {
            var stream = this.rtc.streamEvents[message.message.streamid];
            if (!stream || !stream.stream) {
                return;
            }

            var action = message.message.action;

            if (action === 'ended' || action === 'inactive' || action === 'stream-removed') {
                if (this.rtc.peersBackup[stream.userid]) {
                    stream.extra = this.rtc.peersBackup[stream.userid].extra;
                }
                this.rtc.onstreamended(stream);
                return;
            }

            var type = message.message.type != 'both' ? message.message.type : null;

            if (typeof stream.stream[action] == 'function') {
                stream.stream[action](type);
            }
            return;
        }

        if (message.message === 'dropPeerConnection') {
            this.rtc.deletePeer(message.sender);
            return;
        }

        if (message.message.allParticipants) {
            if (message.message.allParticipants.indexOf(message.sender) === -1) {
                message.message.allParticipants.push(message.sender);
            }

            message.message.allParticipants.forEach(participant => {
                this.rtc.multiPeers[!this.rtc.peers[participant] ? 'createNewPeer' : 'renegotiatePeer'](participant, {
                    localPeerSdpConstraints: {
                        OfferToReceiveAudio: this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: {
                        OfferToReceiveAudio: this.rtc.session.oneway ? !!this.rtc.session.audio : this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: this.rtc.session.oneway ? !!this.rtc.session.video || !!this.rtc.session.screen : this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: !!this.rtc.session.oneway || this.rtc.direction === 'one-way',
                    isDataOnly: isData(this.rtc.session)
                });
            });
            return;
        }

        if (message.message.newParticipant) {
            if (message.message.newParticipant == this.rtc.userid) return;
            if (!!this.rtc.peers[message.message.newParticipant]) return;

            this.rtc.multiPeers.createNewPeer(message.message.newParticipant, message.message.userPreferences || {
                localPeerSdpConstraints: {
                    OfferToReceiveAudio: this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                remotePeerSdpConstraints: {
                    OfferToReceiveAudio: this.rtc.session.oneway ? !!this.rtc.session.audio : this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: this.rtc.session.oneway ? !!this.rtc.session.video || !!this.rtc.session.screen : this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                isOneWay: !!this.rtc.session.oneway || this.rtc.direction === 'one-way',
                isDataOnly: isData(this.rtc.session)
            });
            return;
        }

        if (message.message.readyForOffer) {
            if (this.rtc.attachStreams.length) {
                this.rtc.waitingForLocalMedia = false;
            }

            if (this.rtc.waitingForLocalMedia) {
                // if someone is waiting to join you
                // make sure that we've local media before making a handshake
                setTimeout(function() {
                    onMessageEvent(message);
                }, 1);
                return;
            }
        }

        if (message.message.newParticipationRequest && message.sender !== this.rtc.userid) {
            if (this.rtc.peers[message.sender]) {
                this.rtc.deletePeer(message.sender);
            }

            var userPreferences = {
                extra: message.extra || {},
                localPeerSdpConstraints: message.message.remotePeerSdpConstraints || {
                    OfferToReceiveAudio: this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                remotePeerSdpConstraints: message.message.localPeerSdpConstraints || {
                    OfferToReceiveAudio: this.rtc.session.oneway ? !!this.rtc.session.audio : this.rtc.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: this.rtc.session.oneway ? !!this.rtc.session.video || !!this.rtc.session.screen : this.rtc.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                isOneWay: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!this.rtc.session.oneway || this.rtc.direction === 'one-way',
                isDataOnly: typeof message.message.isDataOnly !== 'undefined' ? message.message.isDataOnly : isData(this.rtc.session),
                dontGetRemoteStream: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!this.rtc.session.oneway || this.rtc.direction === 'one-way',
                dontAttachLocalStream: !!message.message.dontGetRemoteStream,
                connectionDescription: message,
                successCallback: function() {}
            };

            this.rtc.onNewParticipant(message.sender, userPreferences);
            return;
        }

        if (message.message.changedUUID) {
            if (this.rtc.peers[message.message.oldUUID]) {
                this.rtc.peers[message.message.newUUID] = this.rtc.peers[message.message.oldUUID];
                delete this.rtc.peers[message.message.oldUUID];
            }
        }

        if (message.message.userLeft) {
            this.rtc.multiPeers.onUserLeft(message.sender);

            if (!!message.message.autoCloseEntireSession) {
                this.rtc.leave();
            }

            return;
        }

        this.rtc.multiPeers.addNegotiatedMessage(message.message, message.sender);
    }

}