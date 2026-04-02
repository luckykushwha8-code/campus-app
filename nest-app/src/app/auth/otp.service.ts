import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private map: Map<string, string> = new Map();
  private expiry: number = 5 * 60 * 1000; // 5 minutes

  generate(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.map.set(email, code);
    // In real world, send code via email/SMS here
    setTimeout(() => this.map.delete(email), this.expiry);
    return code;
  }

  verify(email: string, code: string): boolean {
    const v = this.map.get(email);
    if (!v) return false;
    if (v !== code) return false;
    this.map.delete(email);
    return true;
  }
}
