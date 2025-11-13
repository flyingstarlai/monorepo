import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersFilterDto } from './dto/users-filter.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const {
        username,
        password,
        fullName,
        deptNo,
        deptName,
        role = 'regular',
        isActive = true,
      } = createUserDto;

      console.log('Creating user with data:', {
        username,
        fullName,
        deptNo,
        deptName,
        role,
        isActive,
      });

      // Always hash passwords for security
      const finalPassword = await bcrypt.hash(password, 10);
      console.log('Generated hash:', finalPassword);
      console.log(
        'Hash test - immediate compare:',
        bcrypt.compareSync(password, finalPassword),
      );

      console.log('Hash to be saved:', finalPassword);
      console.log('Hash type:', typeof finalPassword);
      console.log('Hash length:', finalPassword.length);

      const user = this.usersRepository.create({
        id: this.generateId(),
        username,
        password: finalPassword,
        fullName,
        deptNo,
        deptName,
        role,
        isActive,
      });

      console.log('User entity created:', user);
      const result = await this.usersRepository.save(user);
      console.log('User saved successfully:', result);
      console.log('Password in saved result:', result.password);
      console.log('Password type in result:', typeof result.password);

      // Immediately retrieve to check if hash is corrupted
      const retrieved = await this.usersRepository.findOne({
        where: { username },
      });
      console.log('Immediately retrieved user password:', retrieved?.password);
      console.log(
        'Retrieved matches saved:',
        result.password === retrieved?.password,
      );

      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findWithFilters(filters: UsersFilterDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      role,
      isActive,
      deptNo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.username LIKE :search OR user.fullName LIKE :search OR user.deptName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Apply status filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    // Apply department filter
    if (deptNo) {
      queryBuilder.andWhere('user.deptNo = :deptNo', { deptNo });
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const users = await queryBuilder.getMany();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    console.log('Validating credentials in users service:', {
      username,
      passwordLength: password.length,
    });
    const user = await this.usersRepository.findOne({
      where: { username, isActive: true },
    });

    if (!user) {
      console.log('User not found');
      return null;
    }

    console.log('Found user, comparing password');
    console.log('Stored hash:', user.password);

    // Check if password should be compared as hash or plain text
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    let isValidPassword = false;

    if (shouldHashPassword) {
      // Compare with hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Comparing with bcrypt:', { isValidPassword });
    } else {
      // Compare with plain text password
      isValidPassword = password === user.password;
      console.log('Comparing plain text:', { isValidPassword });
    }

    if (isValidPassword) {
      // Exclude password from returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as User;
    }

    return null;
  }

  async findById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    const finalPassword = shouldHashPassword
      ? await bcrypt.hash(newPassword, 10)
      : newPassword;

    await this.usersRepository.update(id, { password: finalPassword });
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    const newStatus = !user.isActive;
    await this.usersRepository.update(id, { isActive: newStatus });
    return this.findOne(id);
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :query', { query: `%${query}%` })
      .orWhere('user.fullName LIKE :query', { query: `%${query}%` })
      .orWhere('user.deptName LIKE :query', { query: `%${query}%` })
      .orderBy('user.fullName', 'ASC')
      .limit(20)
      .getMany();
  }

  async login(
    user: User,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    // Update lastLoginAt
    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        deptNo: user.deptNo,
        deptName: user.deptName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async updateProfile(
    id: string,
    updateProfileDto: { fullName: string },
  ): Promise<User> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.update(id, updateProfileDto);
    return this.findOne(id);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    let isValidCurrentPassword = false;

    if (shouldHashPassword) {
      isValidCurrentPassword = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );
    } else {
      isValidCurrentPassword =
        changePasswordDto.currentPassword === user.password;
    }

    if (!isValidCurrentPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    const shouldHashNewPassword = process.env.FEATURE_HASHED === 'true';
    const finalPassword = shouldHashNewPassword
      ? await bcrypt.hash(changePasswordDto.newPassword, 10)
      : changePasswordDto.newPassword;

    await this.usersRepository.update(id, { password: finalPassword });

    return { message: 'Password changed successfully' };
  }
}
