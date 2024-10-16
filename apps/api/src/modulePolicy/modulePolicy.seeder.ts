import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { ModulePolicyRepository } from './modulePolicy.repository';
import { PermissionLevel } from './enum/permission-enum';

@Injectable()
export class ModulePolicySeeder extends AbstractSeeder {
  public name = ModulePolicySeeder.name;
  private readonly logger = new Logger(ModulePolicySeeder.name);

  constructor(private readonly modulePolicyRepository: ModulePolicyRepository) {
    super();
  }

  async seed() {
    try {
      const modules = [
        {
          name: 'Dashboard',
          slug: 'dashboard',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Residence',
          slug: 'residence',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Visitors',
          slug: 'visitors',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Developers',
          slug: 'developers',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Brands',
          slug: 'brands',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Rankings',
          slug: 'rankings',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Reviews',
          slug: 'reviews',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Customer Support',
          slug: 'customer-support',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Mailing Campaigns',
          slug: 'mailing-campaigns',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Billings',
          slug: 'billings',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Careers',
          slug: 'careers',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'FAQs',
          slug: 'faqs',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Blog Articles',
          slug: 'blog-articles',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Press Releases',
          slug: 'press-releases',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
        {
          name: 'Admins',
          slug: 'admins',
          permissions: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
        },
      ];

      // Use upsert to avoid duplicates, matching based on slug
      const upsertPromises = modules.map((module) =>
        this.modulePolicyRepository.upsert(
          { slug: module.slug }, // Use slug to ensure unique entries
          {
            $set: {
              ...module,
              isDeleted: false, // Ensure the module is marked as not deleted
            },
          }
        )
      );

      await Promise.all(upsertPromises);
      this.logger.log('Seeding completed for module.');
    } catch (error) {
      this.logger.error('Error while seeding module:', error);
    }
  }
}
