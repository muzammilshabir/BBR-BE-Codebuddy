import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { NewsletterFixture } from './newsletter.fixture';

describe('NewsletterModule', () => {
  const app = new TestSuiteBBR(AppModule, [
    NewsletterFixture,
  ]);
  const url = '/newsletter';

  describe('Subscribe to Newsletter', () => {
    it('Should subscribe to BBR newsletter', async () => {
      const subscribeNewsletterDtop = {
        email: "test2@example.com",
      };

      // Convert the subscribeNewsletterDtop to a JSON string
      const body = JSON.stringify(subscribeNewsletterDtop);

      // Send POST request
      const res = await app.exec('POST', `${url}/subscribe`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

  describe('Unsubscribe to Newsletter', () => {
    it('Should unsubscribe from BBR newsletter', async () => {
      const unsubscribeNewsletterDtop = {
        email: "test@example.com",
      };

      // Convert the unsubscribeNewsletterDtop to a JSON string
      const body = JSON.stringify(unsubscribeNewsletterDtop);

      // Send POST request
      const res = await app.exec('POST', `${url}/unsubscribe`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

});
