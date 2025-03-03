// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return `
    안녕하세요! NestJS HWPML 수식 변환 시스템에 오신 것을 환영합니다.
    Swagger를 통해 API 명세를 확인할 수 있습니다.
    브라우저에서 다음 URL로 접근하세요. -> 
    http://localhost:3000/api
    `;
  }
}
