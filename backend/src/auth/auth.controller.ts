import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async register(@Body() body: any) {
    const result = await this.authService.register(body);
    return {
      success: true,
      message: 'User registered successfully',
      data: result,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const result = await this.authService.getProfile(req.user.userId);
    return {
      success: true,
      message: 'User profile',
      data: result,
    };
  }
}
