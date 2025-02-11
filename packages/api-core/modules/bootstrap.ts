import { ApiKeyGuard } from './../../../apps/api/src/auth/guards/apiKey.guard';
import { SwaggerGuard } from './../../../apps/api/src/auth/guards/swagger.guard';
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
    .addSecurity('ApiKeyAuth', {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    })
    .addSecurityRequirements('ApiKeyAuth')
    .build();

  app.use('/api', (req, res, next) => {
    const guard = new SwaggerGuard();

    try {
      const canAccess = guard.canActivate({
        switchToHttp: () => ({ getRequest: () => req }),
      } as any);

      if (canAccess) {
        return next(); // Allow access if API key/password is valid
      }
    } catch (e) {
      // Always return 401 with WWW-Authenticate header to trigger prompt
      return res
        .status(401)
        .header('WWW-Authenticate', 'Basic realm="Swagger API"')
        .send('Unauthorized');
    }
  });

  app.useGlobalGuards(new ApiKeyGuard());

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
