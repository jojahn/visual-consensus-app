import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [
        svelte(),
        legacy({
            targets: ['defaults', 'not IE 11', "Firefox ESR"]
        })
    ],
    worker: {
        format: "es"
    },
    build: {
        outDir: "docs",
        rollupOptions: {
            input: {
                index: "index.html",
                about: "about.html",
            },
            /* output: {
                format: "commonjs"
            } */
        },
    },
})