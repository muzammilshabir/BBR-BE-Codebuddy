import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from './schema/unit.schema';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { ResidencesFixture } from '../residences/residences.fixture';
import { UploadFixture } from '../upload/upload.fixture';

@Injectable()
export class UnitFixture extends AbstractFixture {
  public dependsOn = [UploadFixture, ResidencesFixture];

  constructor(@InjectModel(Unit.name) private readonly unitModel: Model<Unit>) {
    super();
  }

  static UNIT1 = 'UNIT1';
  static UNIT2 = 'UNIT2';

  async load() {
    const residenceId = this.getReference(ResidencesFixture.RESIDENCE1)._id;
    const mainGalleryPhotoId = this.getReference(UploadFixture.UPLOAD_1)._id;
    const secondGalleryPhotoId = this.getReference(UploadFixture.UPLOAD_2)._id;
    const videoTourId = this.getReference(UploadFixture.UPLOAD_2)._id;

    const unit1 = await this.unitModel.create({
      residenceId: residenceId,
      unitName: 'Unit A',
      specs: {
        unitNumber: '101',
        generalUnitSpaceSqFt: 1200,
        floor: 1,
      },
      unitPrice: 500000,
      exclusiveOffer: {
        exclusiveUnitPrice: 450000,
        OfferStartDate: new Date('2024-08-01'),
        OfferEndDate: new Date('2024-08-31'),
      },
      rooms: [
        {
          roomType: 'Bedroom',
          unit: 1,
        },
        {
          roomType: 'Bathroom',
          unit: 2,
        },
      ],
      briefOverview: {
        subTitle: 'Spacious Unit',
        description: 'A spacious unit with modern amenities.',
      },
      unitKeyFeatures: {
        features: ['Central Heating', 'Air Conditioning'],
        residenceServices: [
          {
            serviceType: 'Cleaning Service',
            amount: 100,
            recurrence: ['Weekly'],
          },
        ],
      },
      visuals: {
        mainGalleryPhotos: [mainGalleryPhotoId],
        secondGalleryPhotos: [secondGalleryPhotoId],
        videoTour: videoTourId,
        videoTourLink: 'http://example.com/video',
      },
      createdById: '60d5f485f7c6a4b2b8e8b601', // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const unit2 = await this.unitModel.create({
      residenceId: residenceId,
      unitName: 'Unit B',
      specs: {
        unitNumber: '102',
        generalUnitSpaceSqFt: 1300,
        floor: 2,
      },
      unitPrice: 550000,
      exclusiveOffer: {
        exclusiveUnitPrice: 500000,
        OfferStartDate: new Date('2024-08-01'),
        OfferEndDate: new Date('2024-08-31'),
      },
      rooms: [
        {
          roomType: 'Living Room',
          unit: 1,
        },
        {
          roomType: 'Kitchen Studio',
          unit: 1,
        },
      ],
      briefOverview: {
        subTitle: 'Modern Unit',
        description: 'A modern unit with premium finishes.',
      },
      unitKeyFeatures: {
        features: ['Balcony', 'Swimming Pool'],
        residenceServices: [
          {
            serviceType: 'Gym Access',
            amount: 50,
            recurrence: ['Monthly'],
          },
        ],
      },
      visuals: {
        mainGalleryPhotos: [mainGalleryPhotoId],
        secondGalleryPhotos: [secondGalleryPhotoId],
        videoTour: videoTourId,
        videoTourLink: 'http://example.com/video',
      },
      createdById: '60d5f485f7c6a4b2b8e8b601', // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addReference(UnitFixture.UNIT1, unit1);
    this.addReference(UnitFixture.UNIT2, unit2);
  }
}
