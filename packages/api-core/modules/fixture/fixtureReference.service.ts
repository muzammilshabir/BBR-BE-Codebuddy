import { Injectable } from '@nestjs/common';

@Injectable()
export class FixtureReferenceService {
  references = new Map<string, unknown>();

  public addReference(name: string, entity: object) {
    this.references.set(name, entity);
  }

  public getReference<Type>(name: string): Type {
    const ref = this.references.get(name);
    if (ref === undefined) {
      throw new Error(`Entity not found: ${name}`);
    }
    return <Type>ref;
  }

  public getAllReferences() {
    return this.references;
  }
}
