import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '@domain/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): any {
    done(null, user.id);
  }

  async deserializeUser(
    userId: number,
    done: (err: Error | null, user: any) => void,
  ): Promise<any> {
    const user = await this.usersService.findOne(userId);
    done(null, user);
  }
}
