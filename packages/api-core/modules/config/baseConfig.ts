import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Abstract class that all configs should inherit from. Contains base utilities.
 */
@Injectable()
export abstract class BaseConfig extends ConfigService {
  readonly environment = this.getOrThrow('NODE_ENV') || 'development';

  readonly isDev = this.environment === 'development';
  readonly isTest = this.environment === 'test';

  protected getBoolean(propertyPath: string): boolean {
    return this.get(propertyPath) === 'true';
  }
}
