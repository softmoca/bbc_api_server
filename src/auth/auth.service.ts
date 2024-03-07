import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersModel } from "src/entites/user.entity";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UserService
  ) {}

  signToken(user: Pick<UsersModel, "email" | "id">, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? "refresh" : "access",
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("SECRET_KEY"),
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, "email" | "id">) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, "email" | "password">
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException("존재하지 않는 사용자입니다.");
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException("비밀번호가 틀렸습니다.");
    }

    return existingUser;
  }

  async loginWithEmail(email_password: Pick<UsersModel, "email" | "password">) {
    const existingUser =
      await this.authenticateWithEmailAndPassword(email_password);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(
      user.password,
      parseInt(this.configService.get<string>("HASH_ROUND"))
    );

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(" ");
    const prefix = isBearer ? "Bearer" : "Basic";

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException("잘못된 토큰입니다!");
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const email_password = Buffer.from(base64String, "base64").toString("utf8");

    const split = email_password.split(":");

    if (split.length !== 2) {
      throw new UnauthorizedException("잘못된 유형의 토큰입니다.");
    }

    const email = split[0];
    const password = split[1];

    return {
      email: email,
      password: password,
    };
  }

  /**
   * 토큰 검증
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>("SECRET_KEY"),
      });
    } catch (e) {
      throw new UnauthorizedException("토큰이 만료됐거나 잘못된 토큰입니다.");
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>("SECRET_KEY"),
      complete: true,
    });
    console.log(decoded.payload.type);

    if (decoded.payload.type !== "refresh") {
      throw new UnauthorizedException(
        "토큰 재발급은 Refresh 토큰으로만 가능합니다!"
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken
    );
  }
}
