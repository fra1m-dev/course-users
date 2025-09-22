import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const cfg = app.get(ConfigService);

  // эти значения уже валидируются и имеют дефолты в Joi
  const rmqUrl = cfg.get<string>('RABBITMQ_URL', { infer: true })!;
  const queue = cfg.get<string>('RMQ_USERS_QUEUE', { infer: true })!;
  const prefetch = Number(
    cfg.get<number>('RMQ_PREFETCH', { infer: true }) ?? 16,
  );
  const port = Number(cfg.get<number>('PORT', { infer: true }) ?? 3002);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue,
      queueOptions: { durable: true },
      prefetchCount: prefetch,
      // noAck по умолчанию false — оставляем поведение с ack
    },
  });

  app.enableShutdownHooks();

  await app.startAllMicroservices();
  // Для /health
  await app.listen(port);

  console.log(
    `[users] http:${port} | rmq:${rmqUrl} q:${queue} prefetch:${prefetch}`,
  );
}
void bootstrap();
