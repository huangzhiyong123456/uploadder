import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class AppService {
  temporaryFolder = 'tmp'

  getHello(): string {
    return 'Hello World!';
  }

  getUpload(md5){
    let filename = this.getFilename(md5)
    let dirsExisted=fs.existsSync(filename)
    if(!dirsExisted){
      fs.mkdirSync(filename)
    }
    return {
      code:'1',
      msg:'get返回成功'
    }
  }

  postUpload(fields,file){
    let chunkFilename = this.getChunkFilename(fields)
    if(!fs.existsSync(chunkFilename)){
      fs.writeFileSync(chunkFilename,file.buffer)
    }
    return {
      code:'1',
      mes:"post返回成功"
    }
  }

  merge({md5,filename}){
    let dirPath = this.getFilename(md5)
    let fileList = fs.readdirSync(dirPath);
    let name = path.resolve(this.temporaryFolder, './' + filename);
    fileList.sort((a, b) => {
      let aLast = a.split('_')[a.split('.').length - 1]
      let bLast = b.split('_')[a.split('.').length - 1]
      return parseInt(aLast) - parseInt(bLast);
    }).forEach(item => {
      fs.appendFileSync(name, fs.readFileSync(`${dirPath}/${item}`));
      fs.unlinkSync(`${dirPath}/${item}`);
    });
    fs.rmdirSync(dirPath);
    
    return {
      code:'1',
      mes:"merge返回成功"
    }
  }

  getFilename(filehash){
    return path.resolve(this.temporaryFolder,'./uploader-'+filehash)
  }

  getChunkFilename({filehash,chunkname}){
    return path.resolve(this.temporaryFolder,'./uploader-' + filehash+'/uploader-'+chunkname);
  }
}
