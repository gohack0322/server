import { io } from "socket.io-client"
import { emitter, events } from "@/utils/event"

const state = {
    socket: null,
    maps: [],
    characters: []
}

const getters = {
    get: state => state.socket,
    maps: state => state.maps,
    characters: state => state.characters,
}

const mutations = {
    init(state, socket) {
        state.socket = socket
    },
    updateMaps(state, maps) {
        state.maps = maps
    },
    updateCharacters(state, characters) {
        state.characters = characters
    }
}

const actions = {
    connect({ commit }, credential) {
        let socket = io.connect(process.env.NODE_ENV == 'production' ? 'https://www.cybllusion.com:9001/' : 'https://localhost:9001/', {query:"userid=admin&adminUserName=" + credential.username + "&adminPassword=" + credential.password})

        commit('init', socket)

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

            console.log(message)
    
            if (message.newUpdates === true) {
                if (socket.auto_update === true) {
                    socket.emit('admin', {
                        all: true
                    });
                    return;
                }
                // $('.new-updates-notifier').show();
            } else {
                commit('updateMaps', message.listOfRooms || [])
                // updateListOfUsers(message.listOfUsers || []);
            }

            commit('updateCharacters', message.listOfUsers || [])
            // $('#active-users').html(message.listOfUsers || 0);
            // $('#scalable-users').html(message.scalableBroadcastUsers || 0);
            // $('#all-sockts').html(message.allSockets || 0);
        });
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}