<template>
    <app-header></app-header>
    <div class="container-fluid">
        <div class="row">
            <app-sidebar></app-sidebar>
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </main>
        </div>
    </div>
</template>
<script>
import Header from './components/header.vue'
import Sidebar from './components/sidebar.vue'
import { defineComponent } from "@vue/runtime-core"

export default defineComponent({
    name: 'Layout',
    components: {
        AppHeader: Header,
        AppSidebar: Sidebar
    }
})
</script>