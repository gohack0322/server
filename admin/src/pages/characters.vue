<template>
    <h4>Characters</h4>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>地圖</th>
                <th>名稱</th>
                <th>等級</th>
                <th>性別</th>
                <th>狀態</th>
                <th>Mail</th>
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
                    <td>
                        <button @click="onSend(character.id, character.user_id)">寄信</button>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>
<script>
import Mailletter from '@/components/modal/mailletter.vue'
import { computed, inject } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
    name: 'Characters',
    setup() {
        const store = useStore()
        const $modal = inject('$vfm')
        const characters = computed(() => store.getters['socket/characters'])

        const onSend = (character_id, user_id) => {
            $modal.show({ component: Mailletter, bind: { signature: '線上GM', characterId: character_id, userId: user_id } })
        }

        return {
            characters,

            onSend
        }
    },
}
</script>