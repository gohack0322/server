<template>
    <layout></layout>
    <modals-container></modals-container>
</template>

<script>
import Login from '@/components/modal/login.vue'
import Layout from '@/Layout.vue'
import { ModalsContainer } from 'vue-final-modal'
import { inject, onBeforeMount, onBeforeUnmount } from '@vue/runtime-core'
import { emitter, events } from "@/utils/event"
import { useRouter } from "vue-router"

export default {
    name: 'App',
    components: {
        Layout,
        ModalsContainer
    },
    setup() {
        const $modal = inject('$vfm')
        const router = useRouter()

        router.push({ name: 'index' })

        $modal.show({ component: Login })

        const onSocketConnect = () => {
            $modal.hide('login')

            router.push({ name: 'maps' })
        }

        onBeforeMount(() => emitter.on(events.onSocketConnect, onSocketConnect))
        onBeforeUnmount(() => emitter.off(events.onSocketConnect, onSocketConnect))
    }
}
</script>
