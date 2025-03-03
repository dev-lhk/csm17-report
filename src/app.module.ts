import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formula } from './report/entities/formula.entity';
import { ReportModule } from './report/report.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Formula],
      synchronize: true, // 개발 단계에서만 사용, 배포 전에는 false 권장
    }),
    ReportModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
