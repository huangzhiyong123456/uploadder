import { Controller, Get, Query, Req, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/up')
  getUp(@Query() query) {
    return this.appService.getUpload(query.md5)
  }

  @Post('/up')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Req() req) {
    return this.appService.postUpload(req.body, req.file)
  }

  @Get('/merge')
  merge(@Query() query){
    return this.appService.merge(query)
  }
}
