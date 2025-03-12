import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private cls: ClsService,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req = context.switchToHttp().getRequest();

    let token = req.cookies.authorization || req.headers.authorization;
    token = token?.split(' ')?.[1] || token;
    try {
      let payload = this.jwt.verify(token);

      if (!payload.userId) throw new UnauthorizedException();

      let user = await this.userService.getUser(payload.userId);
      if (!user) throw new UnauthorizedException();

      this.cls.set('user', user);
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
