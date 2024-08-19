import { SetMetadata } from '@nestjs/common';

export const Refresh = () => SetMetadata('isRefresh', true);
