<template>
    <h4>Characters</h4>
    <table class="table">
        <thead>
            <tr>
                <th>編號</th>
                <th>User ID</th>
                <th>地圖</th>
                <th>名稱</th>
                <th>等級</th>
                <th>性別</th>
                <th>狀態</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(character, index) in characters" :key="`character-${index}`">
                <tr>
                    <td>{{ character.id }}</td>
                    <td>{{ character.user_id }}</td>
                    <td>{{ character.map_id }}</td>
                    <td>{{ character.name }}</td>
                    <td>{{ character.level }}</td>
                    <td>{{ character.gender }}</td>
                    <td>{{ character.status }}</td>
                </tr>
            </template>
        </tbody>
    </table>
</template>
<script>
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
    name: 'Characters',
    setup() {
        const store = useStore()
        const characters = computed(() => store.getters['socket/characters'])

        return {
            characters
        }
    },
}
</script>