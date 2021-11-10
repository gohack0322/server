<template>
    <vue-final-modal name="login" v-bind="$attrs" classes="modal-dialog" content-class="modal-content">
        <div class="modal-body">
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon3">帳號</span>
                    <input type="text" class="form-control" id="username" name="username" v-model="username" aria-describedby="basic-addon3">
                </div>
            </div>
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon3">密碼</span>
                    <input type="password" class="form-control" id="password" name="password" v-model="password" aria-describedby="basic-addon3">
                </div>
            </div>
            <div class="row">
                <button class="btn btn-success w-auto mx-auto" @click="onLogin">登入</button>
            </div>
        </div>
    </vue-final-modal>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useStore } from "vuex"

export default {
    name: 'Login',
    setup() {
        const store = useStore()
        const username = ref('')
        const password = ref('')

        const onLogin = event => {
            event.target.disabled = true

            store.dispatch('socket/connect', { username: username.value, password: password.value })
        }

        return {
            username,
            password,

            onLogin
        }
    }
}
</script>