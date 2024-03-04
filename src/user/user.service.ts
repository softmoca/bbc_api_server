import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "src/entites/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/signUp.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, nickName, password, phone, university } = signUpDto;

    const isUserEmailExist = await this.userRepository.findOne({
      where: { email },
    });
    const isUserNickNamelExist = await this.userRepository.findOne({
      where: { nickName },
    });

    if (isUserEmailExist) {
      throw new NotFoundException("이미 해당 이메일로 가입한 유저가 있습니다.");
    }
    if (isUserNickNamelExist) {
      throw new NotFoundException(
        "이미 해당 닉네임으로 가입한 유저가 있습니다."
      );
    }

    const hasgedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      email: email,
      nickName: nickName,
      password: hasgedPassword,
      phone: phone,
      university: university,
    });

    return user;
  }
}
