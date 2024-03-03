import { Column, Entity } from "typeorm";
import { BaseModel } from "./base.entity";

@Entity()
export class UsersModel extends BaseModel {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column("varchar", { name: "nickName", length: 30 })
  nickName: string;

  @Column()
  university: string;
}
