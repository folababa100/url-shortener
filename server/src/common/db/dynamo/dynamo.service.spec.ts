import { Test, TestingModule } from '@nestjs/testing';
import { DynamoService } from 'src/common/db/dynamo/dynamo.service';

describe('DynamodbService', () => {
  let service: DynamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamoService],
    }).compile();

    service = module.get<DynamoService>(DynamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
