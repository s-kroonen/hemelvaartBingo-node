import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://mongo:27017/bingo'), UserModule],
})
export class AppModule {}
