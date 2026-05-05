import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sacco, SaccoSchema } from './schemas/sacco.schema';
import { SaccosService } from './saccos.service';
import { SaccosController } from './saccos.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sacco.name, schema: SaccoSchema }])],
  controllers: [SaccosController],
  providers: [SaccosService],
  exports: [SaccosService, MongooseModule],
})
export class SaccosModule {}
