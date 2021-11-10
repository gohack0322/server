<template>
    <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
        <ul class="list-unstyled ps-0">
            <li class="mb-1">
                <router-link :to="{ name: 'maps' }">Maps</router-link>
            </li>
            <li class="mb-1">
                <router-link :to="{ name: 'characters' }">Characters</router-link>
            </li>
        </ul>
    </div>
</template>
<script>
import { defineComponent } from "@vue/runtime-core"

export default defineComponent({
    name: 'Sidebar'
})
</script>