import CustomEvent from '../custom-event'
import SparkMD5 from 'spark-md5';
import UploaderFile from './uploader-file'
import UploaderChunk from './uploader-chunk'
import UploadHandle from './upload-handle'
import * as Packtype from './packtype'


interface StreamValue {
    value: any
    done: boolean
}

class Uploader extends CustomEvent {
    public uploadList: UploaderFile[] = [] // 上传的文件列表 
    public chunkSize: number = 1024 * 1024 * 5 // 分块大小
    public url = 'api/up' // 上传url
    private uploadHandle: UploadHandle

    constructor() {
        super()
        this.uploadHandle = new UploadHandle(this.url)

        this.uploadHandle.on('fileSuccess', this.fileSuccess.bind(this))
        this.uploadHandle.on('updateUploadStatus', this.updateUploadStatus.bind(this))
        this.uploadHandle.on('fileProgress', this.fileProgress.bind(this))
        this.uploadHandle.on('nextUpload', this.nextUpload.bind(this))
    }


    /**
    * 将文件添加到上传列表
    * @param file 
    */
    public addFile(file: File) {
        this.addFiles([file])
    }

    public async addFiles(files: File[]) {
        for (const file of files) {
            const uploadItem = new UploaderFile(file)

            const hash = this.getFileUniqueId(file)

            // const hash = await this.getFileMd5(file)
            const chunkList = this.getFileChunk(file, hash, this.chunkSize)
            uploadItem.hash = hash
            uploadItem.chunkList = chunkList
            this.uploadList.push(uploadItem)
        }
        this.dispatchEvent('filesAdded', this.getFileList())
        if (!this.uploadHandle.isuploading) {
            const uploadList = this.uploadList.filter(item => item.status === 'waiting')
            if (uploadList.length > 0) {
                this.upload(uploadList[0])
            }
        }
    }

    public paused(hash) {
        const index = this.uploadList.findIndex(item => item.hash === hash)
        this.uploadList[index].status = Packtype.FileStatus.paused
        this.dispatchEvent('updateUploadStatus', this.getFileList())
    }

    public resume(hash) {
        const index = this.uploadList.findIndex(item => item.hash === hash)
        this.uploadList[index].status = Packtype.FileStatus.waiting
        this.dispatchEvent('updateUploadStatus', this.getFileList())
        if (!this.uploadHandle.isuploading) {
            const uploadList = this.uploadList.filter(item => item.status === 'waiting')
            if (uploadList.length > 0) {
                this.upload(uploadList[0])
            }
        }
    }

    /**
     * 文件上传成功监听
     * @param uploadItem 
     */
    private async fileSuccess(uploadItem: UploaderFile) {
        const filename = uploadItem.raw.name
        const hash = uploadItem.hash
        const url = '/api/merge?md5=' + hash + '&filename=' + filename
        const response = await fetch(url)
        const res = await response.json()
        console.log(res);
        const index = this.uploadList.findIndex(item => item.hash === hash)
        this.uploadList[index].status = Packtype.FileStatus.uploaded
        this.dispatchEvent('fileSuccess', this.getFileList())
        this.nextUpload()
    }

    private updateUploadStatus() {
        this.dispatchEvent('updateUploadStatus', this.getFileList())
    }

    private fileProgress() {
        this.dispatchEvent('updateUploadStatus', this.getFileList())
    }

    private nextUpload() {
        const uploadList = this.uploadList.filter(item => item.status === 'waiting')
        if (uploadList.length > 0) {
            this.upload(uploadList[0])
        } else {
            this.uploadHandle.isuploading = false
        }
    }

    private upload(uploadItem: UploaderFile) {
        this.uploadHandle.addFile(uploadItem)
    }

    private getFileList() {
        return this.uploadList.map(item => ({
            filename: item.raw.name,
            size: item.raw.size,
            hash: item.hash,
            speed: item.speed,
            status: item.status,
            progress: item.progress
        }))
    }


    /**
    * 获取文件块
    * @param file 
    */
    private getFileChunk(file: File, hash: string, chunkSize: number) {
        const count = Math.ceil(file.size / chunkSize)
        const chunklist: UploaderChunk[] = []
        for (let i = 0; i < count; i++) {
            let chunk: any;
            const chunkname = `${hash}_${i}`;
            const filehash = hash;
            const filesize = file.size
            if (i === count - 1) { // 最后一块
                chunk = file.slice(i * chunkSize, file.size)
            } else {
                chunk = file.slice(i * chunkSize, i * chunkSize + chunkSize)
            }
            const item = new UploaderChunk(chunk, chunkname, filehash, filesize, i)
            chunklist.push(item)
        }
        return chunklist
    }

    /**
    * 获取文件hash
    * @param file 
    * @returns 
    */
    private async getFileMd5(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const stream: any = file.stream()
            const reader = stream.getReader()
            const spark = new SparkMD5.ArrayBuffer();

            const procesData: any = ({ value, done }: StreamValue) => {
                if (done) {
                    const md5: string = spark.end()
                    resolve(md5)
                    return
                }

                spark.append(value)
                return reader.read().then(procesData)
            }
            reader.read().then(procesData)
        })
    }

    private getFileUniqueId(file: File): string {
        const str = file.name + file.size + file.lastModified
        const spark = new SparkMD5()
        spark.append(str)
        const md5: string = spark.end()
        return md5
    }
}

const uploader = new Uploader()

export default uploader