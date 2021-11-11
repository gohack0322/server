import { io } from "socket.io-client"
import { emitter, events } from "@/utils/event"
import CONSTANT from "@/Const"

var socket

const state = {
    maps: [],
    characters: []
}

const getters = {
    maps: state => state.maps,
    characters: state => state.characters,
}

const mutations = {
    updateMaps(state, maps) {
        state.maps = maps
    },
    updateCharacters(state, characters) {
        state.characters = characters
    }
}

const actions = {
    connect({ commit }, credential) {
        socket = io.connect(process.env.NODE_ENV == 'production' ? 'https://www.cybllusion.com:9001/' : 'https://localhost:9001/', {query:"userid=admin&adminUserName=" + credential.username + "&adminPassword=" + credential.password})

        socket.on('admin', function(message) {
            if (message.error) {
                alert(message.error, 'Invalid Credentials', null, function() {
                    location.reload();
                });
                return;
            }

            if (message.connected === true) {
                socket.isAdminConnected = true
                emitter.emit(events.onSocketConnect, message)
                socket.emit('admin', { all: true })
                return;
            }
    
            if (message.newUpdates === true) {
                if (socket.auto_update === true) {
                    socket.emit('admin', {
                        all: true
                    });
                    return;
                }
            } else {
                commit('updateMaps', message.listOfRooms || [])
            }

            commit('updateCharacters', message.listOfUsers || [])
        });
    },
    mailletter(context, content) {
        socket.emit('admin', {
            type: CONSTANT.SOCKET.TYPES.MAILLETTER,
            ...content
        })
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}