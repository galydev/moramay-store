import { Module } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { GuestAccountService } from './guest-account.service';

@Module({
  providers: [CustomersRepository, GuestAccountService],
  exports: [CustomersRepository, GuestAccountService],
})
export class CustomersModule {}
