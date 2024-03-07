import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "src/entites/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/signUp.dto";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";

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

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async createUser(user: RegisterUserDto) {
    const nicknameExists = await this.userRepository.exists({
      where: {
        nickName: user.nickName,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException("이미 존재하는 nickname 입니다!");
    }

    const emailExists = await this.userRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException("이미 가입한 이메일입니다!");
    }

    const userObject = this.userRepository.create({
      nickName: user.nickName,
      email: user.email,
      password: user.password,
      university: user.university,
      phone: user.phone,
    });

    const newUser = await this.userRepository.save(userObject);

    return newUser;
  }
}
