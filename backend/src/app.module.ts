import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LoansModule } from './loans/loans.module';
import { PredictionsModule } from './predictions/predictions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { SaccosModule } from './saccos/saccos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/sacco_loans'),
    AuthModule,
    UsersModule,
    ClientsModule,
    LoansModule,
    PredictionsModule,
    ReviewsModule,
    ReportsModule,
    SaccosModule,
  ],
})
export class AppModule {}

