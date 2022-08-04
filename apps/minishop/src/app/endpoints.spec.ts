import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@minishop/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

describe('Cats', () => {
  let app: INestApplication;
  let buyerAccessToken;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const prisma = app.get(PrismaService);
    await prisma.user.create({
      data: {
        id: -1,
        username: 'Test Seller',
        password: await hash('password', 10),
        role: UserRole.Seller,
        products: {
          create: {
            id: -1,
            amountAvailable: 20,
            cost: 15,
            productName: 'Apple'
          }
        }
      }
    });
    await prisma.user.create({
      data: {
        id: -2,
        username: 'Test buyer',
        password: await hash('password', 10),
        role: UserRole.Buyer
      }
    });
    const resp = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        username: 'Test buyer',
        password: 'password',
      });
    buyerAccessToken = resp.body.accessToken;
  });

  it(`Should successfully add deposit`, async () => {
    const resp = await request(app.getHttpServer())
      .put('/users/deposit')
      .send({
        deposit: 100
      })
      .set('Authorization', `Bearer ${buyerAccessToken}`);
    expect(resp.status).toBe(200);
    expect(resp.body.deposit).toBe(100);
  });

  it(`Should successfully buy a product`, async () => {
    const resp = await request(app.getHttpServer())
      .put('/products/buy')
      .send({
        productId: -1,
        amount: 1
      })
      .set('Authorization', `Bearer ${buyerAccessToken}`);
    expect(resp.status).toBe(200);
    expect(resp.body.totalSpent).toBe(15);
    expect(resp.body.product.id).toBe(-1);
    expect(resp.body.change).toEqual([50, 20, 10, 5]);
  })

  it(`Should successfully delete itself`, async () => {
    const resp = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${buyerAccessToken}`);
    expect(resp.status).toBe(200);
  })

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({
      where: {
        username: {
          in: ['Test buyer', 'Test Seller']
        }
      }
    })
    await app.close();
  });
});