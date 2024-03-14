import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let controller: UrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            shortenUrl: jest.fn(() => '123'),
            getUrlAndIncrementStats: jest.fn(() => 'https://www.google.com'),
            deleteUrl: jest.fn(() => '123'),
            getUrlStats: jest.fn(() => ({ id: '123', hits: 1 })),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate a short url', async () => {
    const url = 'https://www.google.com';
    const result = await controller.generate(url);
    expect(result).toBeDefined();
  });

  it('should redirect to the original url', async () => {
    const id = '123';
    const result = await controller.redirect(id);
    expect(result).toBeDefined();
  });

  it('should delete a short url', async () => {
    const id = '123';
    const result = await controller.delete(id);
    expect(result).toBeDefined();
  });

  it('should get the stats of a short url', async () => {
    const id = '123';
    const result = await controller.stats(id);
    expect(result).toBeDefined();
  });
});
