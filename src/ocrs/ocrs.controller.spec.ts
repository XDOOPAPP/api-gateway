import { Test, TestingModule } from '@nestjs/testing';
import { OcrsController } from './ocrs.controller';
import { OcrsService } from './ocrs.service';

describe('OcrsController', () => {
  let controller: OcrsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrsController],
      providers: [OcrsService],
    }).compile();

    controller = module.get<OcrsController>(OcrsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
