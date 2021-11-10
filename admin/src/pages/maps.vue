<template>
    <h4>Maps</h4>
    <table class="table">
        <thead>
            <tr>
                <th>地圖編號</th>
                <th>玩家</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(map, id) in maps" :key="`map-${id}`">
                <tr>
                    <td>{{ id.split('-')[1] }}</td>
                    <td>
                        <template v-for="(user_id, index) in map.participants" :key="`map-${id}-user-${index}`">
                            <span>{{ user_id }}</span>
                        </template>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>
<script>
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
    name: 'Maps',
    setup() {
        const store = useStore()
        const maps = computed(() => store.getters['socket/maps'])

        return {
            maps
        }
    },
}
</script>