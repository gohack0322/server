<template>
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import { Client } from '@utils/socket'
import HelloWorld from './components/HelloWorld.vue'

console.log(Client)

export default {
    name: 'App',
    components: {
        HelloWorld
    },
    setup() {
        let id = random(100)
        let level = random(100)
        let map_id = 1

        const random = max => Math.floor(Math.random() * max)

        Client.userid = id
        Client.extra = {
            id: id,
            level: level,
            name: '',
            gender: '',
            avatar: '',
            image: '',
            map_id: map_id,
            user_id: '',
            status: ''
        }
        // Client.updateExtraData()
        Client.openOrJoin(map_id, (param1,param2,param3) => console.log(param1,param2,param3))
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
