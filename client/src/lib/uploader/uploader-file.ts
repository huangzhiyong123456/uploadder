import * as Packtype from './packtype'
import UploaderChunk from './uploader-chunk'

export default class UploaderFile {
    public raw: File;   // 被上传到文件
    public hash = ''; // 文件hash
    public status: Packtype.FileStatus = Packtype.FileStatus.waiting  // 上传状态
    public progress = 0  // 上传进度
    public speed = 0 // 上传速度
    public chunkList: UploaderChunk[] = []; // 文件分块

    public _lastProgressCallback = 0
    public _prevUploadedSize = 0


    constructor(file: File) {
        this.raw = file
    }    
}