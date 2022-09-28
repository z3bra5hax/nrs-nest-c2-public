import { Test, TestingModule } from '@nestjs/testing';
import { ClientShellSubscriptionService } from './client-shell-subscription.service';

describe('ClientShellSubscriptionService', () => {
  let service: ClientShellSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientShellSubscriptionService],
    }).compile();

    service = module.get<ClientShellSubscriptionService>(ClientShellSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
