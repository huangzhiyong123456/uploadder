<template>
    <div class="upload-list">
        <div class="upload-head">正在上传({{finishCount}}/{{fileList.length}})</div>
        <div class="upload-body">
            <div class="upload-item" v-for="item in fileList" :key="item.hash">
                <div class="upload-item-icon">
                    <img style="width:40px;height:40px" src="../../assets/zip.png">
                </div>
                <div class="upload-item-content">
                    <div class="upload-item-name">{{item.filename}}</div>
                    <div class="upload-item-progress" v-if="item.status!=='uploaded'">
                        <div class="progress-now" :style="{width:item.progress*100+'%'}">
                            <div class="animation" v-if="item.status==='uploading'"></div>
                        </div>
                    </div>
                    <div class="upload-item-detail">
                        <div class="item-size">{{formatSize(item.size)}}</div>
                        <div class="upload-speed" v-if="item.status!=='uploaded'">{{formatSize(item.speed)}}/s</div>
                    </div>
                </div>
                <div class="upload-item-operate">
                    <template v-if="item.status!=='uploaded'">
                        <img v-if="item.status==='uploading'||item.status==='waiting'" class="operate-icon" @click="()=>handlePaused(item)" :src="paused">
                        <img v-else class="operate-icon" :src="goon" @click="()=>startUpload(item)">
                    </template>
                    <img v-if="item.status!=='uploaded'" class="operate-icon" :src="cancal">
                    <img v-else class="operate-icon" :src="uploaded">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import uploader from '../../lib/uploader'
import {paused,goon,restart,cancal,uploaded} from './icon.ts'
import './upload-list.less'
export default {
    data(){
        return {
            fileList:[],
            a:0,
            b:0,
            paused,
            goon,
            restart,
            cancal,
            uploaded
        }
    },
    computed:{
        finishCount(){
            return this.fileList.filter(item=>item.status==='uploaded').length
        }
    },
    mounted(){
        console.log(crypto);

        uploader.on('filesAdded',this.handleFileAdded.bind(this))
        uploader.on('updateUploadStatus',this.handleUpdateUploadStatus.bind(this))
        uploader.on('fileSuccess',this.handleFileSuccess.bind(this))
    },
    beforeDestroy(){
        uploader.off('filesAdded',this.handleFileAdded.bind(this))
        uploader.off('updateUploadStatus',this.handleUpdateUploadStatus.bind(this))
        uploader.off('fileSuccess',this.handleFileSuccess(this))
    },
    methods:{
        handleFileAdded(fileList){
            this.fileList=fileList
        },
        handleUpdateUploadStatus(fileList){
            this.fileList=fileList
        },
        handleFileSuccess(fileList){
            this.fileList=fileList
        },
        handlePaused(item){
            uploader.paused(item.hash)
        },
        startUpload(item){
            uploader.resume(item.hash)
        },
        formatSize(size){
            let KB = size / 1024
            let MB = (size / 1024) / 1024
            let GB = ((size / 1024) / 1024) / 1024
            if (GB > 1) {
                return Math.floor(GB) + 'G'
            } else if (GB < 1 && MB > 1) {
                return Math.floor(MB) + 'M'
            } else if (GB < 1 && MB < 1 && KB > 1) {
                return Math.floor(KB) + 'K'
            } else {
                let s = KB + ''
                return s.substring(0, 3) + 'K'
            }
        }
    }
}
</script>