import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'cross-fetch';

@Injectable()
export class SecurityService {
  constructor(private configService: ConfigService) {}

  async sendMessage(msisdn) {
    const code = this.generate4RandomDigit();
    const res = await fetch(this.configService.get('sms_service.url'), {
      method: 'POST',
      headers: {
        login: this.configService.get('sms_service.username'),
        password: this.configService.get('sms_service.password'),
        Authorization: this.configService.get('sms_service.auth'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            recipient: msisdn,
            'message-id': `pad${uuidv4().substr(0, 15)}`,
            sms: {
              originator: this.configService.get('sms_service.orginator'),
              content: {
                text: `Код подтверждения для Padishah: ${code}`,
              },
            },
          },
        ],
      }),
    });

    return { res, code };
  }

  private generate4RandomDigit() {
    const val = Math.floor(1000 + Math.random() * 9000);
    return val;
  }
}
