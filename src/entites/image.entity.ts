import { Column, Entity, ManyToOne } from "typeorm";
import { BaseModel } from "./base.entity";
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { join } from "path";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
import { PostModel } from "./post.entity";

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({
    type: "enum",
    enum: ImageModelType,
    default: ImageModelType.POST_IMAGE,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return `/${join(POST_PUBLIC_IMAGE_PATH, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => PostModel, (post) => post.images)
  post?: PostModel;
}
