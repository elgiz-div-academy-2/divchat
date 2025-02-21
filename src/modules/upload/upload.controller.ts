import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { imageFileFilter } from './upload.filter';
import { UPLOAD_IMAGE_MAX_SIZE } from 'src/shared/constants/upload.constant';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadImageDto } from './dto/upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
@Auth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: UPLOAD_IMAGE_MAX_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file);
  }
}
