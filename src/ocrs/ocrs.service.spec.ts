import { Test, TestingModule } from '@nestjs/testing';
import { OcrsService } from './ocrs.service';

describe('OcrsService', () => {
  let service: OcrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrsService],
    }).compile();

    service = module.get<OcrsService>(OcrsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
