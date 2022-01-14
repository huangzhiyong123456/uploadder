<template>
    <div>
        <input type="file" @change="handleChange">
    </div>
</template>

<script>
import uploader from '../lib/uploader'
import UploadList from './upload-list'
export default {
    data(){
        return{

        }
    },
    mounted(){
        this.$dialog({
            component:()=>{
                return <UploadList></UploadList>
            }
        })
    },
    methods:{
        handleChange(event){
            let {files} = event.target
            console.log(files);
            for(let file of files){
                uploader.addFile(file)
            }
        }
    }
}
</script>