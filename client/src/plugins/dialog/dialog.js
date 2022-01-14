export default{
    props:{
        component:Function
    },
    mounted(){
        document.body.appendChild(this.$el);
    },
    
    render(){
        return <transition>{this.component()}</transition>
    }
}