import CustomEvent from '../custom-event'
import UploaderFile from './uploader-file'
import UploaderChunk from './uploader-chunk'
import * as Packtype from './packtype'

export default class UploadHandle extends CustomEvent {
    public uploadItem?: UploaderFile;
    public isuploading = false; // 是否正在上传
    public url = ''; // 上传url

    constructor(url: string) {
        super()
        this.url = url
    }

    public addFile(uploadItem: UploaderFile): void {
        this.uploadItem = uploadItem
        this.isuploading = true
        this.handleFile()
    }

    private async handleFile() {
        if (this.uploadItem) {
            if (this.uploadItem.status === 'waiting') {
                this.uploadItem.status = Packtype.FileStatus.uploading
                this.dispatchEvent('updateUploadStatus')
                await this.preUpload()
                await this.upload()
            }
        }
    }

    /**
     * 上传预处理
     */
    private preUpload() {
        return new Promise((resolve, reject) => {
            if (this.uploadItem) {
                const xhr = new XMLHttpRequest()
                const data = new FormData()
                xhr.open('get', this.url + '?md5=' + this.uploadItem.hash)
                xhr.send(data)
                xhr.onload = function (event: any) {
                    const { response } = event.target
                    resolve(response)
                }
            } else {
                reject(null)
            }
        })
    }

    private async upload() {
        if (this.uploadItem) {
            if (this.uploadItem.status === 'paused') {
                this.dispatchEvent('nextUpload')
                return
            } else {
                const chunkList = this.uploadItem.chunkList
                const index: number = chunkList.findIndex(item => !item.isUploaded)
                const uploadedChunks = chunkList.filter(item => item.isUploaded)
                let uploadedSize = 0
                uploadedChunks.forEach(item => {
                    uploadedSize += item.chunk.size
                })
                const totalSize = this.uploadItem.raw.size
                const progress = parseFloat((uploadedSize / totalSize).toFixed(2))
                this.uploadItem.progress = progress
                const diffSize = (uploadedSize - this.uploadItem._prevUploadedSize)
                const diffTime = (Date.now() - this.uploadItem._lastProgressCallback)/1000
                this.uploadItem.speed = parseFloat((diffSize / diffTime).toFixed(2))
                this.uploadItem._prevUploadedSize = uploadedSize
                this.uploadItem._lastProgressCallback = Date.now()
                this.dispatchEvent('fileProgress')
                if (index >= 0) {
                    await this.sendChunk(chunkList[index])
                    this.uploadItem.chunkList[index].isUploaded = true
                    this.upload()
                } else {
                    this.uploadItem.status = Packtype.FileStatus.marge
                    this.dispatchEvent('updateUploadStatus')
                    this.dispatchEvent('fileSuccess', this.uploadItem)
                }
            }
        }
    }

    private sendChunk(chunkItem: UploaderChunk) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            const data = new FormData()

            data.append('filehash', chunkItem.filehash)
            data.append('chunkname', chunkItem.chunkname)
            data.append('file', chunkItem.chunk)

            xhr.open('post', this.url)

            xhr.send(data)

            xhr.onload = function (event: any) {
                const { response } = event.target
                resolve(response)
            }
        })
    }
}