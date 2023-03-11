import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, url: '' }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: (await redisStore({
          url: configService.get('REDIS_ENDPOINT'),
        })) as unknown as CacheStore,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
