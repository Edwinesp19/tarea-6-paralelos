import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('load-test')
  loadTest(): string {
    let sum = 0;
    for (let i = 0; i < 1e6; i++) {
      sum += Math.sqrt(i);
    }
    return `Load test result: ${sum}`;
  }
}
