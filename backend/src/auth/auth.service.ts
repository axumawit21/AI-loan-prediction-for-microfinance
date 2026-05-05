import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Sacco, SaccoDocument } from '../saccos/schemas/sacco.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Sacco.name) private saccoModel: Model<SaccoDocument>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Contact your administrator.');
    }

    // Get SACCO name
    let saccoName = 'SACCO';
    if (user.saccoId) {
      const sacco = await this.saccoModel.findById(user.saccoId);
      if (sacco) saccoName = sacco.name;
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      saccoId: user.saccoId?.toString() || null,
      saccoName,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        saccoId: user.saccoId,
        saccoName,
      },
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
  }
}
