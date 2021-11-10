import { createWebHistory, createRouter } from "vue-router"
import Index from "@/pages/index"
import Characters from "@/pages/characters"
import Maps from "@/pages/maps"

const routes = [
    {
        path: "/",
        name: "index",
        component: Index,
    },
    {
        path: "/maps",
        name: "maps",
        component: Maps,
    },
    {
        path: "/characters",
        name: "characters",
        component: Characters,
    }
];

const router = createRouter({
    history: createWebHistory('/'),
    routes,
});

if (process.env.NODE_ENV !== 'production') {
    window.router = router
}

export default router;