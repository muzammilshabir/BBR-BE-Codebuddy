import { JoiPipeModuleOptions } from 'nestjs-joi/internal/joi-pipe.module';

export const joiConfig: JoiPipeModuleOptions = {
  pipeOpts: {
    defaultValidationOptions: {
      errors: {
        wrap: {
          label: false,
        },
      },
      allowUnknown: false,
    },
    usePipeValidationException: false,
  },
};
