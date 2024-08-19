import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

const emailConfig = (configService: ConfigService) => {
  const print = console.log;

  print(
    '__dirname',
    __dirname,
    path.join(__dirname, '..', '..', '..', '..', 'src', 'mailer', 'templates')
  );
  // /home/abhiw/V2-Projects/BBR-backend/packages/api-core/modules/mailer/templates
  // /home/abhiw/V2-Projects/BBR-backend/apps/api/dist/apps/api/src/mailer/templates/verify-user.hbs
  // /home/abhiw/V2-Projects/BBR-backend/apps/api/dist/apps/api/src/mailer/templates/verify-user.hbs
  // /home/abhiw/V2-Projects/BBR-backend/apps/api/dist/src/mailer/templates/verify-user.hbs
  // /home/abhiw/V2-Projects/BBR-backend/apps/api/dist/apps/api/src/mailer
  // /home/abhiw/V2-Projects/BBR-backend/apps/api/dist/apps/api/src/mailer/templates/verify-user.hbs
  return {
    transport: {
      host: configService.get<string>('NODMAILER_HOST'),
      port: configService.get<number>('NODMAILER_PORT'),
      auth: {
        user: configService.get<string>('NODMAILER_USER'),
        pass: configService.get<string>('NODMAILER_PASS'),
      },
    },
    // modules/mailer/templates/verify-user.hbs
    template: {
      dir: path.join(__dirname, '..', '..', '..', '..', 'src', 'mailer', 'templates'),
      adapter: new HandlebarsAdapter(),
    },
    options: {
      strict: true,
      partials: {
        dir: path.join(__dirname, '..', '..', '..', '..', 'src', 'mailer', 'templates', 'partials'),
        options: {
          strict: true,
        },
      },
    },
  };
};

export const mailerConfig = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => emailConfig(configService),
};
