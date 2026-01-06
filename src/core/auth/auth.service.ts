import { Injectable } from '@nestjs/common';
import { UsersService } from '@domain/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateGoogleUser(profile: any) {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const profilePicture = photos?.[0]?.value;

    let user = await this.usersService.findByGoogleId(id);

    if (!user) {
      user = await this.usersService.findByEmail(email);
    }

    if (!user) {
      user = await this.usersService.create({
        email,
        googleId: id,
        name: displayName,
        profilePicture,
      });
    } else {
      // Update profile picture and name if changed
      user = await this.usersService.update(user.id, {
        name: displayName,
        profilePicture,
      });
    }

    return user;
  }
}
