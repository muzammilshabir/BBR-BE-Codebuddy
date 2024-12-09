import { Logger as NestJsLogger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { BbrConfig } from './config/bbrConfig';
import { GlobalExceptionsFilter } from './exceptions/global.exception';
import { json } from 'body-parser';
import * as cloneBuffer from 'clone-buffer';

export async function bootstrap(appModule: any) {
  BigInt.prototype['toJSON'] = function () {
    return Number(this.toString());
  };
  const app = await NestFactory.create(appModule, {
    rawBody: true,
  });
  app.enableCors();

  app.use(
    json({
      verify: (req: any, res, buf) => {
        if (
          (req.headers['calendly-webhook-signature'] || req.headers['stripe-signature']) &&
          Buffer.isBuffer(buf)
        ) {
          req.rawBody = cloneBuffer(buf);
        }
        return true;
      },
      limit: '5mb',
    })
  );

  // app.useLogger(app.get(Logger));

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionsFilter(httpAdapter));

  const configService = app.get(BbrConfig);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle(`${configService.name} API`)
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Bearer',
    })
    .build();

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);

  const loggerService = new NestJsLogger('Main');

  await app.listen(configService.port).then(() => {
    loggerService.debug(`\n\n\nAPP started on http://localhost:${configService.port}/api`);
  });
}
