import Vue from 'vue'
import Dialog from './dialog'

const DialogConstructor=Vue.extend(Dialog)

function install(Vue) {
    let lastInstance = null
    const DialogContextmenuProxy=function(options) {
        let instance = new DialogConstructor()
        instance.component = options.component
        DialogContextmenuProxy.destroy()
        lastInstance = instance
        instance.$mount()
    }
    DialogContextmenuProxy.destroy=function(){
        if(lastInstance){
            lastInstance.$destroy()
            lastInstance = null
        }
    }
    Vue.prototype.$dialog = DialogContextmenuProxy
}

if (window && window.Vue) {
    install(window.Vue)
}

export default {
    install
}