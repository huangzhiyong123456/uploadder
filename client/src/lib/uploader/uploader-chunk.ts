export default class UploaderChunk {
    public filehash = ''; // 文件md5
    public filesize = 0; // 文件大小
    public chunk;
    public chunkname = ''; // 每块名称
    public order = 0; // 每块序号
    public isUploaded = false; // 是否已经上传

    constructor(chunk: any, chunkname: string, filehash: string, filesize: number, order: number) {
        this.chunk = chunk;
        this.chunkname = chunkname;
        this.filehash = filehash
        this.filesize = filesize;
        this.order = order
    }
}