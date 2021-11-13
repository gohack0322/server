<template>
    <vue-final-modal v-slot="{ close }" name="mailletter" v-bind="$attrs" classes="modal-dialog" content-class="modal-content">
        <div class="modal-header">
            寄信
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="signature">署名</span>
                    <input type="text" class="form-control" v-model="_signature" aria-describedby="signature">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="user_id">玩家ID</span>
                    <input type="text" class="form-control" :value="userId" aria-describedby="user_id" disabled>
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="character_id">角色ID</span>
                    <input type="text" class="form-control" :value="characterId" aria-describedby="character_id" disabled>
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
            <div class="row">
                <span class="col-3 text-end">是否已讀</span>
                <div class="col-9">
                    <input class="form-check-input mt-0" style="vertical-align: text-top;" v-model="is_read" type="checkbox" value="">
                </div>
            </div>
            <div class="row">
                <span class="col-3 text-end">是否已通知</span>
                <div class="col-9">
                    <input class="form-check-input mt-0" style="vertical-align: text-top;" v-model="is_notify" type="checkbox" value="">
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
import { inject } from '@vue/runtime-core'

export default {
    name: 'Mailletter',
    props: {
        signature: {
            type: String,
            default: ''
        },
        characterId: {
            type: Number,
            default: 0
        },
        userId: {
            type: Number,
            default: 0
        }
    },
    setup(props) {
        const $modal = inject('$vfm')
        const store = useStore()
        const _signature = ref(props.signature)
        const title = ref('')
        const content = ref('')
        const is_read = ref(false)
        const is_notify = ref(false)

        const onSend = event => {
            event.target.disabled = true

            store.dispatch('socket/mailletter', {
                    signature: _signature.value,
                    user_id: props.userId,
                    character_id: props.characterId,
                    title: title.value,
                    content: content.value.replace(/\n\r?/g, '<br />'),
                    is_read: is_read.value,
                    is_notify: is_notify.value
                })

            $modal.hide('mailletter')
        }

        return {
            _signature,
            title,
            content,
            is_read,
            is_notify,

            onSend
        }
    }
}
</script>