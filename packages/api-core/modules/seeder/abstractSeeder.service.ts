import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractSeeder {
  public dependsOn: (typeof AbstractSeeder)[] = [];
  public name = 'AbstractSeeder';

  abstract seed(): Promise<void>;
}