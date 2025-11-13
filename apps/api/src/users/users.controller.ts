import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  Query,
  BadRequestException,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() filters: UsersFilterDto) {
    return this.usersService.findWithFilters(filters);
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.usersService.searchUsers(query);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new NotFoundException('User profile not found');
    }
    return req.user;
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: { fullName: string },
  ) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('User not found');
    }
    try {
      return await this.usersService.updateProfile(
        req.user.id,
        updateProfileDto,
      );
    } catch {
      throw new BadRequestException('Failed to update profile');
    }
  }

  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('User not found');
    }
    try {
      return await this.usersService.changePassword(
        req.user.id,
        changePasswordDto,
      );
    } catch {
      throw new BadRequestException('Failed to change password');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.usersService.update(id, updateUserDto);
    } catch {
      throw new BadRequestException('Failed to update user');
    }
  }

  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string) {
    try {
      const user = await this.usersService.toggleUserStatus(id);
      return {
        message: `User status updated to ${user.isActive ? 'active' : 'inactive'}`,
        user,
      };
    } catch {
      throw new BadRequestException('Failed to toggle user status');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    } catch {
      throw new BadRequestException('Failed to delete user');
    }
  }
}
