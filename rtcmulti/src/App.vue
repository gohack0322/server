<template>
    <img alt="Vue logo" src="./assets/logo.png">
    {{ character }}
    {{ peers.getLength() }}
    <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import { reactive } from 'vue'
import { Client } from '@utils/socket'
import HelloWorld from './components/HelloWorld.vue'

console.log(Client)
window.Client = Client

export default {
    name: 'App',
    components: {
        HelloWorld
    },
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

        Client.userid = id
        Client.extra = character
        // Client.updateExtraData()
        Client.openOrJoin(character.map_id, (param1,param2,param3) => console.log(param1,param2,param3))

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
