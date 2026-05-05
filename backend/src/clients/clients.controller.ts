import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @Roles('loan_officer', 'admin')
  async create(@Body() body: any, @Request() req) {
    const client = await this.clientsService.create(body, req.user.userId, req.user.saccoId);
    return {
      success: true,
      message: 'Client registered successfully',
      data: client,
    };
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string, @Query('status') status?: string, @Request() req?) {
    const result = await this.clientsService.findAll(Number(page), Number(limit), search, status, req?.user?.saccoId);
    return {
      success: true,
      message: 'Clients fetched',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);
    if (!client) {
      return {
        success: false,
        message: 'Client not found',
        data: null,
      };
    }
    
    const loans = await this.clientsService.getLoanHistory(id);
    
    return {
      success: true,
      message: 'Client details',
      data: {
        ...client.toObject(),
        loans,
      },
    };
  }

  @Patch(':id')
  @Roles('loan_officer', 'admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const client = await this.clientsService.update(id, body);
    if (!client) {
      return {
        success: false,
        message: 'Client not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Client updated successfully',
      data: client,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const client = await this.clientsService.delete(id);
    if (!client) {
      return {
        success: false,
        message: 'Client not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Client deleted successfully',
      data: client,
    };
  }
}
