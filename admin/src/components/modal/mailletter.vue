<template>
    <vue-final-modal v-slot="{ close }" name="mailletter" v-bind="$attrs" classes="modal-dialog" content-class="modal-content">
        <div class="modal-header">
            寄信
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="signature">署名</span>
                    <input type="text" class="form-control" v-model="signature" aria-describedby="signature">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="user_id">玩家ID</span>
                    <input type="text" class="form-control" v-model="user_id" aria-describedby="user_id">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="character_id">角色ID</span>
                    <input type="text" class="form-control" v-model="character_id" aria-describedby="character_id">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="title">標題</span>
                    <input type="text" class="form-control" v-model="title" aria-describedby="title">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="content">內文</span>
                    <textarea class="form-control" v-model="content" aria-describedby="content" />
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-success w-50 mx-auto" @click="onSend">寄送</button><button class="btn btn-secondary w-50 mx-auto" @click="close">取消</button>
        </div>
    </vue-final-modal>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'

export default {
    name: 'Mailletter',
    setup() {
        const store = useStore()
        const user_id = ref(0)
        const character_id = ref(0)
        const signature = ref('')
        const title = ref('')
        const content = ref('')

        const onSend = () => {
            // event.target.disabled = true

            store.dispatch('socket/mailletter', { signature: signature.value, user_id: user_id.value, character_id: character_id.value, title: title.value, content: content.value.replace(/\n\r?/g, '<br />') })
        }

        return {
            user_id,
            character_id,
            signature,
            title,
            content,

            onSend
        }
    }
}
</script>