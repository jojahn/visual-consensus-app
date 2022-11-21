import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    base: '',
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
            output: {
                entryFileNames: `[name].[hash].mjs`,
                chunkFileNames: `[name].[hash].mjs`,
                // format: "commonjs"
            }
        },
    },
})