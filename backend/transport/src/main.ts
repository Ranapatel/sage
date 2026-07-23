import { NestFactory } from '@nestjs/core';
import { config as loadDotenv } from 'dotenv';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TravelportConfigService } from './modules/flights/infrastructure/travelport/client/travelport-config.service';

async function bootstrap() {
  // Loads backend/transport/.env if it exists. Existing shell env wins.
  loadDotenv();

  const app = await NestFactory.create(AppModule);

  // Fail fast on missing Travelport production credentials before accepting traffic.
  // validateOrThrow() logs the masked client ID / base URL / PCC and exits non-zero
  // if any required env var is empty.
  app.get(TravelportConfigService).validateOrThrow();

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Enable global prefix
  app.setGlobalPrefix('api');

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger Document builder
  const config = new DocumentBuilder()
    .setTitle('TripSage Transport API')
    .setDescription(
      'Transport deep links and integrations for TripSage travel itineraries.',
    )
    .setVersion('1.0.0')
    .addTag('Transport')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`[TripSage Transport Service] 🚀 NestJS running on port ${port}`);
  console.log(
    `[TripSage Transport Service] 📖 Swagger documentation available at http://localhost:${port}/docs`,
  );
}
bootstrap().catch((err) => console.error(err));
