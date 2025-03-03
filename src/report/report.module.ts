import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Formula } from './entities/formula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Formula])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
