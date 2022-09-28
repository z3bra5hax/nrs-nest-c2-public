import { Test, TestingModule } from '@nestjs/testing';
import { SessionRegistrationService } from './session-registration.service';

describe('SessionRegistrationService', () => {
  let service: SessionRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionRegistrationService],
    }).compile();

    service = module.get<SessionRegistrationService>(SessionRegistrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
