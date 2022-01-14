export enum FileStatus{
    waiting = 'waiting', // 等待上传中
    uploading = 'uploading', // 上传中
    paused = 'paused', // 暂停
    marge = 'marge', // 合并中
    uploaded='uploaded', // 上传完成
    error = 'error' // 上传失败
}