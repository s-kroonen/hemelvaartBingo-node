import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';
import {AdminModule} from "./admin/admin.module";

@Module({
  imports: [MongooseModule.forRoot('mongodb://mongo:27017/bingo'), UserModule],
})

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo:27017/bingo'),
    UserModule,
    AdminModule,
  ],
})

export class AppModule {}
