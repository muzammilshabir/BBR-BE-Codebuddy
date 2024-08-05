import { Inject, Injectable } from '@nestjs/common';
import { FixtureReferenceService } from './fixtureReference.service';

@Injectable()
export abstract class AbstractFixture {
  // public dependsOn: (typeof AbstractFixture)[] = [];
  public dependsOn: (new (...args: any[]) => AbstractFixture)[] = [];
  public name = 'AbstractFixture';

  @Inject()
  private readonly fs: FixtureReferenceService;

  abstract load(): Promise<void>;

  protected addReference(name: string, entity: object) {
    this.fs.addReference(name, entity);
  }

  public getReference(name: string): any {
    return this.fs.getReference(name);
  }
}
