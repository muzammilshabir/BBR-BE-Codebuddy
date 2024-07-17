import { BbrConfig } from './bbrConfig';

/**
 * Base config for all APIs, stateful services
 */
export abstract class BbrStatefulServiceConfig extends BbrConfig {
  port = this.services[this.getServiceName()].port || this.get<number>('APP_PORT');
  name = this.services[this.getServiceName()].name || this.get<number>('APP_NAME');
}
