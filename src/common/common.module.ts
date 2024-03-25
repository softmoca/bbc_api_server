import { BadRequestException, Module } from "@nestjs/common";
import { CommonController } from "./common.controller";
import { CommonService } from "./common.service";
import * as multer from "multer";
import { extname } from "path";
import { v4 as uuid } from "uuid";
import { TEMP_FOLDER_PATH } from "./const/path.const";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [
    AuthModule,
    UserModule,
    MulterModule.register({
      limits: {
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);

        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
          return cb(
            new BadRequestException("jpg/jpeg/png 파일만 업로드 가능합니다!"),
            false
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],

  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
