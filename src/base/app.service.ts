import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    Congrats on GETting here.
    Unfortunately there's nothing to see here.
    Try a socket homie.
    `;
  }
}
