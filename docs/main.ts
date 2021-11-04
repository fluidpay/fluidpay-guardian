import './scss/index.scss'

import { createApp } from 'vue'
import App from './App.vue'

import Prism from 'prismjs'
import Normalizer from 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace'
import 'prismjs/plugins/toolbar/prism-toolbar'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'

// Prism
new Normalizer({
    'remove-trailing': true,
    'remove-indent': true,
    'left-trim': true,
    'right-trim': true
})

const prismMixin = {
    updated() {
        Prism.highlightAll()
    }
}

createApp(App).mixin(prismMixin).mount('#app')
