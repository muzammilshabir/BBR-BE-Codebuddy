import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { SectionRepository } from './section.repository';
import { PermissionLevel } from './enum/permission-enum';

@Injectable()
export class SectionSeeder extends AbstractSeeder {
  public name = SectionSeeder.name;
  private readonly logger = new Logger(SectionSeeder.name);

  constructor(private readonly sectionRepository: SectionRepository) {
    super();
  }

  async seed() {
    try {
      const sections = [
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
      const upsertPromises = sections.map((section) =>
        this.sectionRepository.upsert(
          { slug: section.slug }, // Use slug to ensure unique entries
          {
            $set: {
              ...section,
              isDeleted: false, // Ensure the section is marked as not deleted
            },
          }
        )
      );

      await Promise.all(upsertPromises);
      this.logger.log('Seeding completed for Section.');
    } catch (error) {
      this.logger.error('Error while seeding Section:', error);
    }
  }
}
