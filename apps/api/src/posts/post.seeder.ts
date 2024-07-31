import { Injectable } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service'

@Injectable()
export class PostModuleSeeder extends AbstractSeeder {
  public name = PostModuleSeeder.name;

  constructor(     
  ) {
    super();
  }
  async seed() {
    try {
      console.log("i am here in user seeder");
    } catch (error) {
    }
  }


}
