import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    const result = await this.usersService.findAll(Number(page), Number(limit), search);
    return {
      success: true,
      message: 'Users fetched',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'User found',
      data: user,
    };
  }

  @Post()
  @Roles('admin')
  async create(@Body() body: any) {
    const user = await this.usersService.create(body);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.usersService.update(id, body);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'User deleted successfully',
      data: user,
    };
  }
}
