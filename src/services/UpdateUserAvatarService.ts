import path from 'path';
import fs from 'fs';
import { getRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import User from '../models/User';

interface Request {
  user_id: string;
  avatarFilename: string;
}

class UpdateUserAvatarService {
  async execute({ user_id, avatarFilename }: Request): Promise<User> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne(user_id);
    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      const avatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarFileExists = await fs.promises.stat(avatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(avatarFilePath);
      }
    }

    user.avatar = avatarFilename;

    delete user.password;

    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
