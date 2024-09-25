import { TestSuite } from "@bbr/api-core/modules/testing/test.suite";
import { ClassProvider, ValueProvider } from "@nestjs/common";
import { UserRole } from "src/users/enum/user.enum";
import { UserFixture } from "src/users/user.fixture";

export class TestSuiteBBR extends TestSuite {
  constructor(
    AppModule: any,
    fixtures: any[],
    overrideProviders: (ClassProvider | ValueProvider)[] = []
  ) {
    fixtures.push(UserFixture);
    super(AppModule, fixtures, overrideProviders);
  }
  async getUserToken(role: UserRole) {
    const path = role == UserRole.BUYER ? "buyer" : "seller";
    const response = await this.exec('POST', `/auth/${path}/login/email`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        "email": `${role.toLowerCase()}@example.com`,
        "password": "Pass@123",
      },
    });
    return response.body.data.tokens.accessToken;
  }
}
