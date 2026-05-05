import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SaccosService } from './saccos.service';

@Controller('saccos')
export class SaccosController {
  constructor(private readonly saccosService: SaccosService) {}

  @Post()
  async create(@Body() body: { name: string }) {
    const sacco = await this.saccosService.create(body);
    return { success: true, message: 'SACCO created', data: sacco };
  }

  @Get()
  async findAll() {
    const saccos = await this.saccosService.findAll();
    return { success: true, message: 'SACCOs fetched', data: saccos };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const sacco = await this.saccosService.update(id, body);
    return { success: true, message: 'SACCO updated', data: sacco };
  }
}
