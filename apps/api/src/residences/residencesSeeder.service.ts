import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { City } from 'src/city/schema/city.schema';
import { ResidenceType } from 'src/residenceType/schema/residenceType.schema';
import { ResidenceRepository } from './residences.repository';
import * as XLSX from 'xlsx';
import { Country } from 'src/country/schema/country.schema';
import axios from 'axios';
import { ResidenceTypeRepository } from 'src/residenceType/residenceType.repository';
import { BrandRepository } from 'src/brand/brand.repository';
import { ResidenceFeatureRepository } from 'src/residenceFeatures/residenceFeatures.repository';
import { AmenityRepository } from 'src/amenities/amenities.repository';
import { LifeStyleRepository } from 'src/lifestyles/lifeStyle.repository';
import { PropertyTypeRepository } from 'src/propertyType/propertyType.repository';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { RankingRequestRepository } from 'src/rankingRequest/rankingRequest.repository';
import { GeographicalAreasRepository } from 'src/geographicalAreas/geographicalAreas.repository';
import { RankingCategoryStatus } from 'src/rankingCategory/enum/rankingCategory-status.enum';
import { CategoryType } from 'src/rankingCategory/enum/category-type.enum';
import { BrandCategoryRepository } from 'src/brandCategory/brandCategoryRepository.repository';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { RankingRequestStatus } from 'src/rankingRequest/enum/rankingRequest-status.enum';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { UploadRepository } from 'src/upload/upload.repository';
import { StateRepository } from 'src/state/state.repository';
import { State } from 'src/state/schema/state.schema';
import { Location } from 'src/location/schema/location.schema';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';
import { BrandDraftRepository } from '../brandDraft/brandDraft.repository';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import { ResidenceDraftRepository } from '../residencesDraft/residencesDraft.repository';
import { RankingRequestDraftRepository } from '../rankingRequestDraft/rankingRequestDraft.repository';
import { RankingRequest } from 'src/rankingRequest/schema/rankingRequest.schema';
import { Brand } from 'src/brand/schema/brand.schema';
import { PropertyType } from 'src/propertyType/schema/propertyType.schema';
import { Plan } from '../subscription-plan/schema/plan.schema';

interface Residence {
  residence_id: string;
  name: string;
  residencetype_id: string;
  address: string;
  website_link?: string;
  brand_id: string;
  subtitle: string;
  brief_description: string;
  general_description: string;
  community?: string;
  recent_renovation?: string;
  local_attractions?: string;
  future_development?: string;
  start_range?: string;
  end_range?: string;
  build_year?: string;
  rental_potential: string;
  development_status: string;
  floor_area_sqft?: string;
  pet_policy?: string;
  staff_to_residence_ratio?: string;
  highlighted_amenity_id1?: string;
  highlighted_amenity_description1?: string;
  highlighted_amenity_image_path1?: string;
  highlighted_amenity_id2?: string;
  highlighted_amenity_description2?: string;
  highlighted_amenity_image_path2?: string;
  highlighted_amenity_id3?: string;
  highlighted_amenity_description3?: string;
  highlighted_amenity_image_path3?: string;
  country_id: string;
  state?: string;
  city_id: string;
  lifestyle_id?: string;
  main_photo?: string;
  main_gallery_path?: string;
  main_gallery_images?: string;
  second_gallery_path?: string;
  second_gallery_images?: string;
  amenity_ids: string;
  avg_price_per_unit?: string;
  ameneties_count?: string;
  no_of_units?: string;
}

const categoryTypeMapping = {
  'country': CategoryType.COUNTRY,
  'city': CategoryType.CITY,
  'lifestyle': CategoryType.LIFESTYLE,
  'brand': CategoryType.BRAND,
  'property_type': CategoryType.PROPERTY_TYPE,
  'geographical_area': CategoryType.GEOGRAPHY,
};

@Injectable()
export class ResidenceSeederService {
  private readonly logger = new Logger(ResidenceSeederService.name);
  private readonly BATCH_SIZE = 10;
  private readonly s3Client: S3Client;

  constructor(
    private readonly residenceRepository: ResidenceRepository,
    private readonly residenceTypeRepository: ResidenceTypeRepository,
    private readonly brandRepository: BrandRepository,
    private readonly residenceFeatureRepository: ResidenceFeatureRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly lifeStyleRepository: LifeStyleRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly rankingRequestRepository: RankingRequestRepository,
    private readonly geographicalAreasRepository: GeographicalAreasRepository,
    private readonly brandCategoryRepository: BrandCategoryRepository,
    private readonly brandDraftRepository: BrandDraftRepository,
    private readonly rankingCategoryDraftRepository: RankingCategoryDraftRepository,
    private readonly residenceDraftRepository: ResidenceDraftRepository,
    private readonly rankingRequestDraftRepository: RankingRequestDraftRepository,

    @InjectModel(City.name)
    private readonly cityModel: Model<City>,
    @InjectModel(ResidenceType.name)
    private readonly residenceTypeModel: Model<ResidenceType>,
    @InjectModel(Country.name)
    private readonly countryModel: Model<Country>,
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
    @InjectModel(State.name)
    private readonly stateModel: Model<State>,
    private readonly uploadRepository: UploadRepository,
    private readonly stateRepository: StateRepository,
    @InjectModel(Location.name)
    private readonly locationModel: Model<Location>,
    @InjectModel(RankingCategory.name)
    private readonly rankingCategoryModel: Model<RankingCategory>,
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    @InjectModel(PropertyType.name) private readonly propertyTypeModel: Model<PropertyType>,
    @InjectModel(PropertyType.name) private readonly geographicalAreasModel: Model<PropertyType>,
    @InjectModel(PropertyType.name) private readonly lifestyleModel: Model<PropertyType>
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_BUCKET_REGION,
      ...(process.env.END_POINT && {
        endpoint: `https://${process.env.END_POINT}`,
        forcePathStyle: true,
      }),
      credentials: {
        accessKeyId: process.env.AWS_S3_USER_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_USER_SECRET,
      },
    });
  }

  async processUploadedFile(file: Express.Multer.File) {
    console.log('Starting file processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processFileInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'File processing started',
    };
  }

  private async processFileInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;
    const errors = {
      rankingCategories: [],
      residences: [],
    };

    try {
      console.log('Processing file in background:', file.originalname);

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheets = {
        residences: XLSX.utils.sheet_to_json(workbook.Sheets['Residences']),
        residenceTypes: XLSX.utils.sheet_to_json(workbook.Sheets['ResidenceTypes']),
        brands: XLSX.utils.sheet_to_json(workbook.Sheets['Brands']),
        residenceFeatures: XLSX.utils.sheet_to_json(workbook.Sheets['ResidenceFeatures']),
        cities: XLSX.utils.sheet_to_json(workbook.Sheets['Cities']),
        countries: XLSX.utils.sheet_to_json(workbook.Sheets['Countries']),
        amenities: XLSX.utils.sheet_to_json(workbook.Sheets['Amenities']),
        lifestyles: XLSX.utils.sheet_to_json(workbook.Sheets['Lifestyles']),
        rankingCategories: XLSX.utils.sheet_to_json(workbook.Sheets['RankingCategories']),
        rankingCriterias: XLSX.utils.sheet_to_json(workbook.Sheets['RankingCriteria']),
        residenceScores: XLSX.utils.sheet_to_json(workbook.Sheets['ResidenceScore']),
        propertyTypes: XLSX.utils.sheet_to_json(workbook.Sheets['PropertyTypes']),
        geographicalArea: XLSX.utils.sheet_to_json(workbook.Sheets['GeographicalArea']),
        brandCategories: XLSX.utils.sheet_to_json(workbook.Sheets['BrandCategory']),
      };

      // Countries processing
      console.log('Processing Countries...');
      for (let i = 0; i < sheets.countries.length; i += BATCH_SIZE) {
        console.log(
          `Processing Countries batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.countries.length / BATCH_SIZE)}`
        );
        const batch = sheets.countries.slice(i, i + BATCH_SIZE);

        if (i === 0) {
          await this.countryModel.updateMany({ isDeleted: false }, { $set: { active: false } });
        }

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        for (const singleCountry of batch) {
          try {
            let geographicalArea;

            const country = singleCountry as any;

            if (country.geographical_area_id) {
              geographicalArea = await this.processGeographicalArea(
                country,
                sheets.geographicalArea
              );
            }

            let countryDoc = await this.countryModel.findOne({
              name: {
                $regex: `^${country.name.replace(/[()]/g, '\\$&')}$`,
                $options: 'i',
              },
              isDeleted: false,
            });

            if (!countryDoc) {
              const countryData: any = {
                name: country.name,
                countryCode: country.country_code,
                active: true,
                isDeleted: false,
                displayOrder: !isNaN(Number(country.display_order))
                  ? Number(country.display_order)
                  : undefined,
              };

              if (geographicalArea) {
                countryData.geographicalAreasId = new Types.ObjectId(geographicalArea._id);
              }

              countryDoc = await this.countryModel.create(countryData);
            } else if (countryDoc.active === false) {
              countryDoc = await this.countryModel.findByIdAndUpdate(
                countryDoc._id,
                {
                  active: true,
                  displayOrder: !isNaN(Number(country.display_order))
                    ? Number(country.display_order)
                    : undefined,
                },
                { new: true }
              );
            } else {
              countryDoc = await this.countryModel.findByIdAndUpdate(
                countryDoc._id,
                {
                  displayOrder: !isNaN(Number(country.display_order))
                    ? Number(country.display_order)
                    : undefined,
                },
                { new: true }
              );
            }
          } catch (error) {
            errors.residences.push({
              id: (singleCountry as any).country_id,
              name: (singleCountry as any).name,
              error: error.message,
            });
          }
        }
      }

      // Cities processing
      console.log('Processing Cities...');
      for (let i = 0; i < sheets.cities.length; i += BATCH_SIZE) {
        console.log(
          `Processing Cities batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.cities.length / BATCH_SIZE)}`
        );
        const batch = sheets.cities.slice(i, i + BATCH_SIZE);

        // Set all cities to inactive on first batch
        if (i === 0) {
          await this.cityModel.updateMany({ isDeleted: false }, { $set: { active: false } });
        }

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        for (const singleCity of batch) {
          try {
            const city = singleCity as any;

            let cityDoc;
            let countryId;

            if (city.country_id) {
              countryId = await this.processCountry(city, sheets.countries);
            }

            const searchQuery: any = {
              name: {
                $regex: `^${city.name.replace(/[()]/g, '\\$&')}$`,
                $options: 'i',
              },
              isDeleted: false,
            };

            if (countryId) {
              searchQuery.countryId = new Types.ObjectId(countryId);
            }

            cityDoc = await this.cityModel.findOne(searchQuery);

            if (!cityDoc) {
              const cityData: any = {
                name: city.name,
                active: true,
                isDeleted: false,
                displayOrder: !isNaN(Number(city.display_order))
                  ? Number(city.display_order)
                  : undefined,
              };

              if (countryId) {
                cityData.countryId = new Types.ObjectId(countryId);
              }

              cityDoc = await this.cityModel.create(cityData);
            } else if (cityDoc.active === false) {
              // Update city status
              cityDoc = await this.cityModel.findByIdAndUpdate(
                cityDoc._id,
                {
                  active: true,
                  displayOrder: !isNaN(Number(city.display_order))
                    ? Number(city.display_order)
                    : undefined,
                },
                { new: true }
              );

              if (cityDoc.stateCode) {
                try {
                  let stateDoc = await this.stateModel.findOne({
                    stateCode: cityDoc.stateCode,
                    countryId: cityDoc.countryId,
                    isDeleted: false,
                  });

                  if (!stateDoc) {
                    stateDoc = await this.stateModel.create({
                      stateCode: cityDoc.stateCode,
                      countryId: cityDoc.countryId,
                      countryCode: cityDoc.countryCode,
                      name: cityDoc.state || cityDoc.stateCode,
                      active: true,
                    });
                  } else if (!stateDoc.active) {
                    stateDoc = await this.stateModel.findByIdAndUpdate(
                      stateDoc._id,
                      {
                        $set: {
                          active: true,
                          countryId: cityDoc.countryId,
                        },
                      },
                      { new: true }
                    );
                  }

                  await this.cityModel.findByIdAndUpdate(
                    cityDoc._id,
                    {
                      $set: {
                        stateId: stateDoc._id,
                        countryId: cityDoc.countryId,
                      },
                    },
                    { new: true }
                  );
                } catch (error) {
                  console.error(
                    `Error updating state/city relationships for stateCode ${cityDoc.stateCode}:`,
                    error
                  );
                }
              }
            } else {
              cityDoc = await this.cityModel.findByIdAndUpdate(
                cityDoc._id,
                {
                  displayOrder: !isNaN(Number(city.display_order))
                    ? Number(city.display_order)
                    : undefined,
                },
                { new: true }
              );
            }
          } catch (error) {
            errors.residences.push({
              id: (singleCity as any).city_id,
              name: (singleCity as any).name,
              error: error.message,
            });
          }
        }
      }

      // Brands processing
      console.log('Processing Brands...');
      for (let i = 0; i < sheets.brands.length; i += BATCH_SIZE) {
        console.log(
          `Processing Brands batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.brands.length / BATCH_SIZE)}`
        );
        const batch = sheets.brands.slice(i, i + BATCH_SIZE);

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        for (const singleBrand of batch) {
          try {
            const brand = singleBrand as any;

            let brandDoc = await this.brandRepository.find({
              name: { $regex: new RegExp(`^${brand.name}$`, 'i') },
            });

            if (brandDoc) {
              brandDoc = await this.brandModel.findByIdAndUpdate(
                brandDoc._id,
                {
                  displayOrder: !isNaN(Number(brand.display_order))
                    ? Number(brand.display_order)
                    : undefined,
                },
                { new: true }
              );
              const brandDraftDoc = await this.brandDraftRepository.findLatest({
                brandId: new Types.ObjectId(brandDoc.id),
              });

              const plainBrand = brandDoc.toJSON();
              delete plainBrand._id;

              if (!brandDraftDoc) {
                await this.brandDraftRepository.create({
                  ...plainBrand,
                  brandId: new Types.ObjectId(brandDoc.id),
                });
              } else {
                await this.brandDraftRepository.updateWithFilter(
                  { brandId: new Types.ObjectId(brandDoc.id) },
                  { $set: { ...plainBrand } }
                );
              }
            } else {
              const brandData = {
                name: brand.name,
                description: brand.description || '',
                registeredDate: new Date(),
                status: 'active',
                brandCategoryId: await this.processBrandCategory(brand, sheets.brandCategories),
                displayOrder: !isNaN(Number(brand.display_order))
                  ? Number(brand.display_order)
                  : undefined,
              };

              brandDoc = await this.brandRepository.create(brandData);

              // Create a draft document for the new brand
              await this.brandDraftRepository.create({
                brandId: new Types.ObjectId(brandDoc.id),
                ...brandData,
              });
            }
          } catch (error) {
            errors.residences.push({
              id: (singleBrand as any).Brand_id,
              name: (singleBrand as any).name,
              error: error.message,
            });
          }
        }
      }

      // Ranking categories processing
      console.log('Processing Ranking Categories...');
      for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
        console.log(
          `Processing Ranking Categories batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.rankingCategories.length / BATCH_SIZE)}`
        );
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);

        for (const rankingCategory of batch) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const rankingCategoryTyped = rankingCategory as any;
            let criteria;

            if (
              rankingCategoryTyped.criteria_id1 ||
              rankingCategoryTyped.criteria_id2 ||
              rankingCategoryTyped.criteria_id3 ||
              rankingCategoryTyped.criteria_id4 ||
              rankingCategoryTyped.criteria_id5 ||
              rankingCategoryTyped.criteria_id6
            ) {
              criteria = await this.processCriteria(rankingCategoryTyped, sheets.rankingCriterias);
            }

            const idFields = [
              'country_id',
              'city_id',
              'lifestyle_id',
              'brand_id',
              'property_type_id',
              'geographical_area_id',
            ];
            //Todo: check this logic
            const foundIdField = idFields.find((field) => Boolean(rankingCategoryTyped[field]));

            if (!foundIdField) {
              throw new Error(
                `No valid ID field found for rankingCategory: ${rankingCategoryTyped.title}`
              );
            }

            const categoryType = foundIdField.replace('_id', '');
            const mappedCategoryType = categoryTypeMapping[rankingCategoryTyped.category_type];

            if (!mappedCategoryType) {
              throw new Error(`Invalid category type mapping for: ${categoryType}`);
            }
            const doc = await this.processCategoryType(mappedCategoryType, rankingCategoryTyped, {
              countries: sheets.countries,
              cities: sheets.cities,
              lifestyles: sheets.lifestyles,
              brands: sheets.brands,
              propertyTypes: sheets.propertyTypes,
              geographicalType: sheets.geographicalArea,
              brandCategories: sheets.brandCategories,
            });
            const rankingCategoryData = this.createRankingCategoryData(rankingCategoryTyped, {
              doc,
              mappedCategoryType,
              criteria,
              foundIdField,
            });

            const foundRankingCategory = await this.rankingCategoryRepository.find({
              title: new RegExp(`^${rankingCategoryData.title}$`, 'i'),
            });
            if (!foundRankingCategory) {
              const rankingCategory =
                await this.rankingCategoryRepository.create(rankingCategoryData);
              await this.rankingCategoryDraftRepository.create({
                ...rankingCategoryData,
                rankingCategoryId: new Types.ObjectId(rankingCategory.id),
              });
            } else {
              const plainRankingCategory = foundRankingCategory.toJSON();
              delete plainRankingCategory._id;

              await this.rankingCategoryRepository.update(foundRankingCategory._id.toString(), {
                ...plainRankingCategory,
                ...rankingCategoryData,
              });

              const rankingCategoryDraft = await this.rankingCategoryDraftRepository.findLatest({
                rankingCategoryId: foundRankingCategory._id,
              });

              if (!rankingCategoryDraft) {
                await this.rankingCategoryDraftRepository.create({
                  ...rankingCategoryData,
                  rankingCategoryId: new Types.ObjectId(foundRankingCategory.id),
                });
              } else {
                const plainRankingCategoryDraft = rankingCategoryDraft.toJSON();
                delete plainRankingCategoryDraft._id;

                await this.rankingCategoryDraftRepository.update(
                  rankingCategoryDraft._id.toString(),
                  {
                    ...plainRankingCategoryDraft,
                    ...rankingCategoryData,
                  }
                );
              }
            }
          } catch (error) {
            errors.rankingCategories.push({
              id: (rankingCategory as any).ranking_category_id,
              name: (rankingCategory as any).title,
              error: error.message,
            });
          }
        }
      }

      // Residences processing
      console.log('Processing Residences...');
      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        console.log(
          `Processing Residences batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.residences.length / BATCH_SIZE)}`
        );
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        for (const singleResidence of batch) {
          try {
            const residence = singleResidence as Residence;
            await new Promise((resolve) => setTimeout(resolve, 200));

            const residenceTypeDoc = await this.processResidence(residence, sheets.residenceTypes);

            const brandDoc = residence.brand_id
              ? await this.processBrand(residence, sheets.brands, sheets.brandCategories)
              : null;

            const cityDoc = await this.processCity(residence, sheets.cities, sheets.countries);

            const freePlan = await this.planModel.findById(process.env.FREE_RESIDENCE_PLAN_ID);
            const countryDoc = await this.processCountry(residence, sheets.countries);
            await new Promise((resolve) => setTimeout(resolve, 100));
            const lifeStyleDoc = residence.lifestyle_id
              ? await this.processLifestyle(residence, sheets.lifestyles)
              : null;

            const placeDetails = residence.address
              ? await this.getPlaceDetails(residence.address)
              : null;

            const residenceFeatureIds = Object.keys(residence).some((key) =>
              key.startsWith('feature_id')
            )
              ? await this.processResidenceFeature(residence, sheets.residenceFeatures)
              : [];
            await new Promise((resolve) => setTimeout(resolve, 100));

            const amenityIds = residence.amenity_ids
              ? await this.processAmenity(residence, sheets.amenities)
              : [];
            await new Promise((resolve) => setTimeout(resolve, 100));
            const highlightedAmenities =
              residence.highlighted_amenity_id1 ||
              residence.highlighted_amenity_id2 ||
              residence.highlighted_amenity_id3
                ? await this.findAmenities(residence, sheets.amenities)
                : [];
            const propertyTypeDoc = await this.processProperty(residence, sheets.propertyTypes);

            const residenceData = this.createResidenceData(residence, {
              residenceTypeDoc,
              brandDoc,
              residenceFeatureIds,
              cityDoc,
              countryDoc,
              amenityIds,
              highlightedAmenities,
              lifeStyleDoc,
              placeDetails,
              propertyTypeDoc,
              freePlan,
            });

            let foundResidence = await this.residenceRepository.find({
              name: new RegExp(`^${residenceData.name}$`, 'i'),
              cityId: residenceData.cityId,
            });

            if (!foundResidence) {
              foundResidence = await this.residenceRepository.create(residenceData);
              await this.residenceDraftRepository.create({
                ...residenceData,
                residenceId: new Types.ObjectId(foundResidence.id),
              });
            } else {
              const plainResidence = foundResidence.toJSON();
              delete plainResidence._id;

              foundResidence = await this.residenceRepository.update(
                foundResidence._id.toString(),
                { ...plainResidence, ...residenceData }
              );

              const residenceDraft = await this.residenceDraftRepository.findLatest({
                residenceId: foundResidence._id,
              });
              if (!residenceDraft) {
                await this.residenceDraftRepository.create({
                  ...residenceData,
                  residenceId: new Types.ObjectId(foundResidence.id),
                });
              } else {
                const plainResidenceDraft = residenceDraft.toJSON();
                delete plainResidenceDraft._id;
                await this.residenceDraftRepository.update(residenceDraft._id.toString(), {
                  ...plainResidenceDraft,
                  ...residenceData,
                });
              }
            }

            const rankingScoreDocArray = await this.processResidenceScores(
              foundResidence._id.toString(),
              residence,
              sheets.rankingCategories,
              sheets.residenceScores
            );

            if (rankingScoreDocArray?.length) {
              for (const scoreDoc of rankingScoreDocArray) {
                const existingRequest = await this.rankingRequestRepository.find({
                  rankingCategoryId: scoreDoc.rankingCategoryId,
                  residenceId: scoreDoc.residenceId,
                });
                const residence = await this.residenceRepository.findById(scoreDoc.residenceId);
                let rankingRequest: RankingRequest;

                if (existingRequest) {
                  const plainResidencExistingRequest = existingRequest.toJSON();
                  delete plainResidencExistingRequest._id;
                  rankingRequest = await this.rankingRequestRepository.update(
                    existingRequest._id.toString(),
                    {
                      ...plainResidencExistingRequest,
                      criteriaScores: scoreDoc.criteriaScores,
                      bbrScore: scoreDoc.bbrScore,
                      updatedAt: new Date(),
                    }
                  );

                  const rankingRequestDraft = await this.rankingRequestDraftRepository.findLatest({
                    rankingRequestId: existingRequest._id,
                  });

                  if (!rankingRequestDraft) {
                    await this.rankingRequestDraftRepository.create({
                      ...scoreDoc,
                      rankingRequestId: new Types.ObjectId(existingRequest.id),
                    });
                  } else {
                    const plainRankingRequestDraft = rankingRequestDraft.toJSON();
                    delete plainRankingRequestDraft._id;
                    await this.rankingRequestDraftRepository.update(
                      rankingRequestDraft._id.toString(),
                      {
                        ...plainRankingRequestDraft,
                        ...scoreDoc,
                      }
                    );
                  }
                } else {
                  rankingRequest = await this.rankingRequestRepository.create(scoreDoc);
                  await this.rankingRequestDraftRepository.create({
                    ...scoreDoc,
                    rankingRequestId: new Types.ObjectId(scoreDoc.id),
                  });
                }

                if (
                  !residence?.highestBbrScore ||
                  residence.highestBbrScore < rankingRequest.bbrScore
                ) {
                  await this.residenceRepository.update(residence.id, {
                    highestBbrScore: rankingRequest.bbrScore,
                    highestRankingCategoryId: new Types.ObjectId(rankingRequest.rankingCategoryId),
                  });
                }
              }
            }
          } catch (error) {
            errors.residences.push({
              id: (singleResidence as Residence).residence_id,
              name: (singleResidence as Residence).name,
              error: error.message,
            });
          }
        }
      }

      console.log('File processing completed:', file.originalname);
      console.log('Errors:', errors);

      return {
        success: true,
        errors,
      };
    } catch (error) {
      console.error('Error processing file:', file.originalname, error);
      return {
        success: false,
        error: error.message,
        errors,
      };
    }
  }

  private getSchemaField(idField: string): string {
    const fieldMapping = {
      'country_id': 'countryId',
      'city_id': 'cityId',
      'lifestyle_id': 'lifeStyleId',
      'brand_id': 'brandId',
      'property_id': 'propertyTypeId',
      'geographical_area_id': 'geoGraphyId',
    };
    return fieldMapping[idField];
  }

  private createResidenceData(
    residence: Residence,
    data: {
      residenceTypeDoc: any;
      brandDoc: any;
      residenceFeatureIds: any[];
      cityDoc: any;
      countryDoc: any;
      amenityIds: any[];
      highlightedAmenities: any[];
      lifeStyleDoc: any;
      placeDetails: any;
      propertyTypeDoc: any;
      freePlan: any;
    }
  ) {
    const baseData: any = {
      name: residence.name,
      isDeleted: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      eVerification: true,
      verifiedOn: new Date(),
      planId: new Types.ObjectId(data.freePlan.id),
    };

    // Add required reference IDs
    if (data.cityDoc?._id) {
      baseData.cityId = new Types.ObjectId(data.cityDoc._id);
    }

    if (data.countryDoc?._id) {
      baseData.countryId = new Types.ObjectId(data.countryDoc._id);
    }

    if (data.lifeStyleDoc?._id) {
      baseData.lifeStyleId = new Types.ObjectId(data.lifeStyleDoc._id);
    }

    // Handle required IDs and basic fields
    if (data.residenceTypeDoc?._id) {
      baseData.residenceTypeIds = [new Types.ObjectId(data.residenceTypeDoc._id)];
    }

    if (data.propertyTypeDoc?._id) {
      baseData.propertyTypeIds = [new Types.ObjectId(data.propertyTypeDoc._id)];
    }

    if (residence.website_link?.toString().trim()) {
      baseData.websiteLink = residence.website_link;
    }

    if (data.brandDoc?._id) {
      baseData.associatedBrandId = new Types.ObjectId(data.brandDoc._id);
    }

    if (data.placeDetails?.placeId?.toString().trim()) {
      baseData.placeId = data.placeDetails.placeId;
    }

    // Handle briefOverview
    if (residence.subtitle?.toString().trim() || residence.brief_description?.toString().trim()) {
      const briefOverview: any = {};

      if (residence.subtitle?.toString().trim()) {
        briefOverview.subtitle = residence.subtitle;
      }
      if (residence.brief_description?.toString().trim()) {
        briefOverview.briefDescription = residence.brief_description;
      }

      if (Object.keys(briefOverview).length > 0) {
        baseData.briefOverview = briefOverview;
      }
    }

    // Handle comprehensiveOverview
    if (
      residence.subtitle?.toString().trim() ||
      residence.general_description?.toString().trim() ||
      residence.community?.toString().trim() ||
      residence.recent_renovation?.toString().trim() ||
      residence.local_attractions?.toString().trim() ||
      residence.future_development?.toString().trim()
    ) {
      const comprehensiveOverview: any = {};

      if (residence.subtitle?.toString().trim()) {
        comprehensiveOverview.subtitle = residence.subtitle;
      }
      if (residence.general_description?.toString().trim()) {
        comprehensiveOverview.generalDescription = residence.general_description;
      }
      if (residence.community?.toString().trim()) {
        comprehensiveOverview.community = residence.community;
      }
      if (residence.recent_renovation?.toString().trim()) {
        comprehensiveOverview.recentRenovation = residence.recent_renovation;
      }
      if (residence.local_attractions?.toString().trim()) {
        comprehensiveOverview.localAttractions = residence.local_attractions;
      }
      if (residence.future_development?.toString().trim()) {
        comprehensiveOverview.futureDevelopmentPlans = residence.future_development;
      }

      if (Object.keys(comprehensiveOverview).length > 0) {
        baseData.comprehensiveOverview = comprehensiveOverview;
      }
    }

    // Handle residenceKeyFeatures
    if (
      data?.residenceFeatureIds?.length > 0 ||
      residence.build_year?.toString().trim() ||
      residence.rental_potential?.toString().trim() ||
      residence.development_status?.toString().trim() ||
      residence.pet_policy?.toString().trim() ||
      residence.floor_area_sqft?.toString().trim() ||
      residence.avg_price_per_unit?.toString().trim() ||
      residence.ameneties_count?.toString().trim() ||
      residence.no_of_units?.toString().trim()
    ) {
      const residenceKeyFeatures: any = {};

      if (data?.residenceFeatureIds?.length > 0) {
        residenceKeyFeatures.featureIds = data.residenceFeatureIds;
      }

      const developmentInfo: any = {};

      if (residence.build_year?.toString().trim()) {
        const yearOfBuild = Number(residence.build_year);
        if (!isNaN(yearOfBuild)) {
          developmentInfo.yearOfBuild = yearOfBuild;
        }
      }
      if (residence.rental_potential?.toString().trim()) {
        developmentInfo.rentalPotential = residence.rental_potential;
      }
      if (residence.development_status?.toString().trim()) {
        developmentInfo.developmentStatus = residence.development_status;
      }

      if (Object.keys(developmentInfo).length > 0) {
        residenceKeyFeatures.developmentInfo = developmentInfo;
      }

      if (residence.pet_policy?.toString().trim()) {
        residenceKeyFeatures.petPolicy = residence.pet_policy;
      }

      if (residence.floor_area_sqft?.toString().trim()) {
        const floorArea = Number(residence.floor_area_sqft.split('k')[0]) * 1000;
        if (!isNaN(floorArea)) {
          residenceKeyFeatures.developmentInfo.floorAreaSqFt = floorArea;
        }
      }

      if (Object.keys(residenceKeyFeatures).length > 0) {
        baseData.residenceKeyFeatures = residenceKeyFeatures;
      }

      if (residence.avg_price_per_unit?.toString().trim()) {
        residenceKeyFeatures.avgPricePerUnit =
          Number(residence.avg_price_per_unit.split('M')[0]) * 1000000;
      }

      if (residence.ameneties_count?.toString().trim()) {
        residenceKeyFeatures.amenitiesCount = Number(residence.ameneties_count.split('+')[0]);
      }

      if (residence.no_of_units?.toString().trim()) {
        residenceKeyFeatures.noOfUnits = Number(residence.no_of_units);
      }
    }

    // Handle nearbyAmenities
    if (data.amenityIds?.length > 0 || data.highlightedAmenities?.length > 0) {
      const nearbyAmenities: any = {};

      if (data.amenityIds?.length > 0) {
        nearbyAmenities.amenitiesList = data.amenityIds;
      }
      if (data.highlightedAmenities?.length > 0) {
        nearbyAmenities.highlightedAmenities = data.highlightedAmenities;
      }

      if (Object.keys(nearbyAmenities).length > 0) {
        baseData.nearbyAmenities = nearbyAmenities;
      }
    }

    if (residence.start_range?.toString().trim() || residence.end_range?.toString().trim()) {
      const budgetLimitationsRange: any = {};

      if (residence.start_range?.toString().trim()) {
        const startRange = Number(residence.start_range);
        if (!isNaN(startRange)) {
          budgetLimitationsRange.startRange = startRange;
        }
      }

      if (residence.end_range?.toString().trim()) {
        const endRange = Number(residence.end_range);
        if (!isNaN(endRange)) {
          budgetLimitationsRange.endRange = endRange;
        }
      }

      if (Object.keys(budgetLimitationsRange).length > 0) {
        baseData.budgetLimitationsRange = budgetLimitationsRange;
      }
    }

    // Handle address
    if (
      data.countryDoc?.name?.toString().trim() ||
      residence.state?.toString().trim() ||
      data.cityDoc?.name?.toString().trim() ||
      residence.address?.toString().trim() ||
      data.placeDetails?.latitude ||
      data.placeDetails?.longitude
    ) {
      const address: any = {};

      if (data.countryDoc?.name?.toString().trim()) {
        address.country = data.countryDoc.name;
      }
      if (residence.state?.toString().trim()) {
        address.state = residence.state;
      }
      if (data.cityDoc?.name?.toString().trim()) {
        address.city = data.cityDoc.name;
      }
      if (residence.address?.toString().trim()) {
        address.userInput = residence.address;
      }

      if (data.placeDetails?.latitude || data.placeDetails?.longitude) {
        const location: any = {};
        if (data.placeDetails.latitude) {
          location.lat = data.placeDetails.latitude;
        }
        if (data.placeDetails.longitude) {
          location.lng = data.placeDetails.longitude;
        }
        if (Object.keys(location).length > 0) {
          address.location = location;
        }
      }

      if (data.placeDetails?.placeId?.toString().trim()) {
        address.placeId = data.placeDetails.placeId;
      }

      if (Object.keys(address).length > 0) {
        baseData.address = address;
      }
    }

    return baseData;
  }

  async processResidenceScores(
    residenceId: any,
    residence: Residence,
    rankingCategories: any[],
    residenceScores: any[]
  ) {
    try {
      const matchingScores = residenceScores.filter(
        (score) => score.residence_id == residence.residence_id
      );
      // console.log("matchingScores",matchingScores)

      const processedScores = [];

      for (const score of matchingScores) {
        const rankingCategory = rankingCategories.find(
          (rc) => rc['ranking_ category_id'] === score['ranking_ category_id']
        );

        if (!rankingCategory) continue;

        const foundRankingCategory = await this.rankingCategoryModel.findOne({
          title: { $regex: new RegExp(`^${rankingCategory.title}$`, 'i') },
        });
        // Type assertion to tell TypeScript about the structure
        const criteriaIds =
          (foundRankingCategory as any)?.criteria?.map((criterion) => criterion._id) || [];

        const criteriaScores = [];
        for (let i = 1; i <= 6; i++) {
          const criteriaFeedback = score[`criteria${i}_feedback`];
          const criteriaScore = score[`criteria${i}_score`];
          const criteriaId = new Types.ObjectId(criteriaIds[i - 1]);

          if (criteriaFeedback && criteriaScore && criteriaId) {
            criteriaScores.push({
              criteriaId: new Types.ObjectId(criteriaId),
              score: Number(criteriaScore),
              description: criteriaFeedback,
            });
          }
        }

        const residenceScoreDoc = {
          rankingCategoryId: foundRankingCategory._id,
          residenceId: new Types.ObjectId(residenceId),
          paymentStatus: PaymentStatus.PAID,
          upload: [],
          status: RankingRequestStatus.ACTIVE,
          isDeleted: false,
          criteriaScores,
          bbrScore: Number(score.bbr_score),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        processedScores.push(residenceScoreDoc);
      }

      return processedScores;
    } catch (error) {
      throw new Error(`Error processing residence scores: ${error.message}`);
    }
  }

  private async processCategoryType(categoryType, rankingCategory, dataSources) {
    switch (categoryType) {
      case 'country':
        return await this.processCountry(rankingCategory, dataSources.countries);
      case 'city':
        return await this.processCity(rankingCategory, dataSources.cities, dataSources.countries);
      case 'lifestyle':
        return await this.processLifestyle(rankingCategory, dataSources.lifestyles);
      case 'brand':
        return await this.processBrand(
          rankingCategory,
          dataSources.brands,
          dataSources.brandCategories
        );
      case 'property_type':
        return await this.processProperty(rankingCategory, dataSources.propertyTypes);
      case 'geography':
        return await this.processGeographicalArea(rankingCategory, dataSources.geographicalType);
      default:
        throw new Error(`Unsupported category type: ${categoryType}`);
    }
  }

  private async processProperty(model: any, properties: any[]) {
    const matchingPropertyType = properties.find(
      (property) => property.property_type_id === model.property_type_id
    );
    if (!matchingPropertyType) {
      throw new Error(`Property with property_id ${model.property_id} not found`);
    }

    let propertyTypeDoc = await this.propertyTypeRepository.find({
      name: { $regex: new RegExp(`^${matchingPropertyType.name}$`, 'i') },
    });

    if (!propertyTypeDoc) {
      const propertyData: any = {
        name: matchingPropertyType.name,
        displayOrder: !isNaN(Number(matchingPropertyType.display_order))
          ? Number(matchingPropertyType.display_order)
          : undefined,
      };

      propertyTypeDoc = await this.propertyTypeRepository.create(propertyData);
    } else {
      propertyTypeDoc = await this.propertyTypeModel.findByIdAndUpdate(
        propertyTypeDoc._id,
        {
          displayOrder: !isNaN(Number(matchingPropertyType.display_order))
            ? Number(matchingPropertyType.display_order)
            : undefined,
        },
        { new: true }
      );
    }

    return propertyTypeDoc;
  }

  private async processGeographicalArea(model: any, geographicalAreas: any[]) {
    const matchingArea = geographicalAreas.find((area) => area.id == model.geographical_area_id);
    if (!matchingArea) {
      throw new Error(`Geographical area with id ${model.geographical_area_id} not found`);
    }

    let geographicalAreaDoc = await this.geographicalAreasRepository.find({
      name: { $regex: new RegExp(`^${matchingArea.name}$`, 'i') },
    });
    if (!geographicalAreaDoc) {
      const areaData: any = {
        name: matchingArea.name,
        displayOrder: !isNaN(Number(matchingArea.display_order))
          ? Number(matchingArea.display_order)
          : undefined,
      };

      geographicalAreaDoc = await this.geographicalAreasRepository.create(areaData);
    } else {
      geographicalAreaDoc = await this.geographicalAreasModel.findByIdAndUpdate(
        geographicalAreaDoc._id,
        {
          displayOrder: !isNaN(Number(matchingArea.display_order))
            ? Number(matchingArea.display_order)
            : undefined,
        },
        { new: true }
      );
    }
    return geographicalAreaDoc;
  }

  private async processCriteria(rankingCategory: any, rankingCriterias: any[]) {
    const criteria = [];

    for (let i = 1; i < 7; i++) {
      const criteriaId = rankingCategory[`criteria_id${i}`];
      if (!criteriaId) {
        continue;
      }
      const matchingCriteria = rankingCriterias.find(
        (rankingCriteria) => rankingCriteria.criteria_id === criteriaId
      );

      if (matchingCriteria) {
        const singleCriteria = {
          name: matchingCriteria.name,
          weight: matchingCriteria.weight,
          scoreGuide: [
            {
              score: Number(matchingCriteria[`scoreguide0`]),
              description: matchingCriteria[`scoreguide0_description`] || '',
            },
            {
              score: Number(matchingCriteria[`scoreguide20`]),
              description: matchingCriteria[`scoreguide20_description`] || '',
            },
            {
              score: Number(matchingCriteria[`scoreguide40`]),
              description: matchingCriteria[`scoreguide40_description`] || '',
            },
            {
              score: Number(matchingCriteria[`scoreguide60`]),
              description: matchingCriteria[`scoreguide60_description`] || '',
            },
            {
              score: Number(matchingCriteria[`scoreguide80`]),
              description: matchingCriteria[`scoreguide80_description`] || '',
            },
            {
              score: Number(matchingCriteria[`scoreguide100`]),
              description: matchingCriteria[`scoreguide100_description`] || '',
            },
          ],
        };
        criteria.push(singleCriteria);
      }
    }

    return criteria;
  }

  private async processResidence(residence: any, residencesTypes: any[]) {
    const matchingResidenceType = residencesTypes.find(
      (residenceType) => residenceType.residencetype_id === residence.residencetype_id
    );

    if (!matchingResidenceType) {
      throw new Error(`Residence type with id ${residence.residencetype_id} not found`);
    }

    let residenceTypeDoc = await this.residenceTypeModel.findOne({
      type: { $regex: new RegExp(`^${matchingResidenceType.type}$`, 'i') },
    });

    if (!residenceTypeDoc) {
      const residenceData = {
        type: matchingResidenceType.type,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ResidenceType;

      residenceTypeDoc = await this.residenceTypeModel.create(residenceData);
    }
    return residenceTypeDoc;
  }

  private async processBrand(model: any, brands: any[], brandCategories: any[]): Promise<any> {
    const matchingBrand = brands.find((brand) => brand.Brand_id == model.brand_id);

    if (!matchingBrand) {
      this.logger.error(`Brand not found for residence: ${model.brand_id}`);
      return null;
    }

    let brandDoc = await this.brandRepository.find({
      name: { $regex: new RegExp(`^${matchingBrand.name}$`, 'i') },
    });

    if (brandDoc) {
      brandDoc = await this.brandModel.findByIdAndUpdate(
        brandDoc._id,
        {
          displayOrder: !isNaN(Number(matchingBrand.display_order))
            ? Number(matchingBrand.display_order)
            : undefined,
        },
        { new: true }
      );

      const brandDraftDoc = await this.brandDraftRepository.findLatest({
        brandId: new Types.ObjectId(brandDoc.id),
      });

      const plainBrand = brandDoc.toJSON();
      delete plainBrand._id;

      if (!brandDraftDoc) {
        // Create a new draft document
        await this.brandDraftRepository.create({
          ...plainBrand,
          brandId: new Types.ObjectId(brandDoc.id),
        });
      } else {
        // Update the existing draft document
        await this.brandDraftRepository.updateWithFilter(
          { brandId: new Types.ObjectId(brandDoc.id) },
          { $set: { ...plainBrand } }
        );
      }
    } else {
      // If the brand does not exist, create it
      const brandData = {
        name: matchingBrand.name,
        description: matchingBrand.description || '',
        registeredDate: new Date(),
        status: 'active',
        brandCategoryId: await this.processBrandCategory(matchingBrand, brandCategories),
        displayOrder: !isNaN(Number(matchingBrand.display_order))
          ? Number(matchingBrand.display_order)
          : undefined,
      };

      brandDoc = await this.brandRepository.create(brandData);

      // Create a draft document for the new brand
      await this.brandDraftRepository.create({
        brandId: new Types.ObjectId(brandDoc.id),
        ...brandData,
      });
    }

    return brandDoc;
  }

  private async processBrandCategory(brand: any, brandCategories: any[]) {
    const matchingBrandCategory = brandCategories.find(
      (category) => category.brand_category_id == brand.brand_category_id
    );

    if (!matchingBrandCategory) {
      throw new Error(`Brand category with id ${brand.brand_category_id} not found`);
    }
    if (matchingBrandCategory.name == 'Luxury Hotel and Resort Brands') {
      matchingBrandCategory.name = 'Luxury Hotel Resort Brands';
    }
    let brandCategoryDoc = await this.brandCategoryRepository.find({
      name: { $regex: new RegExp(matchingBrandCategory.name, 'i') },
    });

    if (!brandCategoryDoc) {
      const brandCategoryData: any = {
        name: matchingBrandCategory.name,
      };

      brandCategoryDoc = await this.brandCategoryRepository.create(brandCategoryData);
    }
    return brandCategoryDoc;
  }

  private async processResidenceFeature(residence: any, residenceFeatures: any[]) {
    const featureIds = [];
    const residenceFeatureIds = residence.feature_ids.split(',');

    for (const residenceFeatureId of residenceFeatureIds) {
      const matchingResidenceFeature = residenceFeatures.find(
        (residenceFeature) => residenceFeature.id == residenceFeatureId
      );

      if (!matchingResidenceFeature) {
        continue;
      }

      let residenceFeatureDoc = await this.residenceFeatureRepository.find({
        name: { $regex: new RegExp(`^${matchingResidenceFeature.name}$`, 'i') },
      });

      if (!residenceFeatureDoc) {
        const featureData: any = {
          name: matchingResidenceFeature.name,
        };

        residenceFeatureDoc = await this.residenceFeatureRepository.create(featureData);
      }

      if (residenceFeatureDoc?._id) {
        featureIds.push(new Types.ObjectId(residenceFeatureDoc._id.toString()));
      }
    }
    return featureIds;
  }

  private async processCity(model: any, cities: any[], countries: any[]) {
    const matchingCity = cities.find((city) => city.city_id == model.city_id);

    if (!matchingCity) {
      throw new Error(`City with city_id ${model.city_id} not found`);
    }

    if (matchingCity.logo) {
      matchingCity.logo = matchingCity.logo.replace(/^"|"$/g, '').trim();
    }

    let cityDoc;
    let countryId;

    if (matchingCity.country_id) {
      countryId = await this.processCountry(matchingCity, countries);
    }

    const searchQuery: any = {
      name: {
        $regex: `^${matchingCity.name.replace(/[()]/g, '\\$&')}$`,
        $options: 'i',
      },
      isDeleted: false,
    };

    if (countryId) {
      searchQuery.countryId = new Types.ObjectId(countryId);
    }

    cityDoc = await this.cityModel.findOne(searchQuery);

    if (!cityDoc) {
      const cityData: any = {
        name: matchingCity.name,
        displayOrder: !isNaN(Number(matchingCity.display_order))
          ? Number(matchingCity.display_order)
          : undefined,
        active: true,
      };

      if (countryId) {
        cityData.countryId = new Types.ObjectId(countryId);
      }

      cityDoc = await this.cityModel.create(cityData);
    } else if (cityDoc.active === false) {
      // Update city status
      cityDoc = await this.cityModel.findByIdAndUpdate(
        cityDoc._id,
        {
          active: true,
          displayOrder: !isNaN(Number(matchingCity.display_order))
            ? Number(matchingCity.display_order)
            : undefined,
        },
        { new: true }
      );

      // Only update state if stateCode exists
      if (cityDoc.stateCode) {
        try {
          let stateDoc = await this.stateModel.findOne({
            stateCode: cityDoc.stateCode,
            countryId: cityDoc.countryId,
            isDeleted: false,
          });

          if (!stateDoc) {
            stateDoc = await this.stateModel.create({
              stateCode: cityDoc.stateCode,
              countryId: cityDoc.countryId,
              countryCode: cityDoc.countryCode,
              name: cityDoc.state || cityDoc.stateCode,
              active: true,
            });
          } else if (!stateDoc.active) {
            stateDoc = await this.stateModel.findByIdAndUpdate(
              stateDoc._id,
              {
                $set: {
                  active: true,
                  countryId: cityDoc.countryId,
                },
              },
              { new: true }
            );
          }

          await this.cityModel.findByIdAndUpdate(
            cityDoc._id,
            {
              $set: {
                stateId: stateDoc._id,
                countryId: cityDoc.countryId,
              },
            },
            { new: true }
          );
        } catch (error) {
          console.error(
            `Error updating state/city relationships for stateCode ${cityDoc.stateCode}:`,
            error
          );
        }
      }
    } else {
      cityDoc = await this.cityModel.findByIdAndUpdate(
        cityDoc._id,
        {
          displayOrder: !isNaN(Number(matchingCity.display_order))
            ? Number(matchingCity.display_order)
            : undefined,
        },
        { new: true }
      );
    }
    return cityDoc;
  }

  private async processCountry(model: any, countries: any[]) {
    const matchingCountry = countries.find((country) => country.country_id == model.country_id);

    if (!matchingCountry) {
      throw new Error(`Country with country_id ${model.country_id} not found`);
    }

    if (matchingCountry.logo) {
      matchingCountry.logo = matchingCountry.logo.replace(/^"|"$/g, '').trim();
    }

    let countryDoc = await this.countryModel.findOne({
      name: {
        $regex: `^${matchingCountry.name.replace(/[()]/g, '\\$&')}$`,
        $options: 'i',
      },
      isDeleted: false,
    });

    if (!countryDoc) {
      const countryData: any = {
        name: matchingCountry.name,
        displayOrder: !isNaN(Number(matchingCountry.display_order))
          ? Number(matchingCountry.display_order)
          : undefined,
        active: true,
      };

      countryDoc = await this.countryModel.create(countryData);
    } else if (countryDoc.active === false) {
      countryDoc = await this.countryModel.findByIdAndUpdate(
        countryDoc._id,
        {
          active: true,
          displayOrder: !isNaN(Number(matchingCountry.display_order))
            ? Number(matchingCountry.display_order)
            : undefined,
        },
        { new: true }
      );
    } else {
      countryDoc = await this.countryModel.findByIdAndUpdate(
        countryDoc._id,
        {
          displayOrder: !isNaN(Number(matchingCountry.display_order))
            ? Number(matchingCountry.display_order)
            : undefined,
        },
        { new: true }
      );
    }

    return countryDoc;
  }

  private async processAmenity(residence: any, amenities: any[]) {
    const ids = [];
    const amenityIds = residence.amenity_ids.replace(/^'|'$/g, '').split(',');

    for (const amenityId of amenityIds) {
      const matchingAmenity = amenities.find((amenity) => amenity.id == amenityId);

      if (!matchingAmenity) {
        continue;
      }

      let amenityDoc = await this.amenityRepository.find({
        name: { $regex: new RegExp(`^${matchingAmenity.name}$`, 'i') },
      });

      if (!amenityDoc) {
        const amenityData: any = {
          name: matchingAmenity.name,
        };

        amenityDoc = await this.amenityRepository.create(amenityData);
      }

      if (amenityDoc?._id) {
        ids.push(amenityDoc._id);
      }
    }
    return ids;
  }

  private async findAmenities(residence: any, amenities: any[]) {
    const highlightedAmenities = [];

    for (let i = 1; i < 4; i++) {
      if (!residence[`highlighted_amenity_id${i}`]) {
        continue;
      }

      const matchingAmenity = amenities.find(
        (amenity) => amenity.id == residence[`highlighted_amenity_id${i}`]
      );
      if (!matchingAmenity) {
        continue;
      }

      const amenityDoc = await this.amenityRepository.find({ name: matchingAmenity.name });

      if (!amenityDoc) {
        continue;
      }
      const highlightedAmenity: any = {
        amenityId: amenityDoc._id,
      };

      if (residence[`highlighted_amenity_description${i}`]) {
        highlightedAmenity.generalDescription = residence[`highlighted_amenity_description${i}`];
      }

      highlightedAmenities.push(highlightedAmenity);
    }
    return highlightedAmenities;
  }

  private async processLifestyle(model: any, lifestyles: any[]) {
    const matchingLifestyle = lifestyles.find(
      (lifestyle) => lifestyle.lifestyle_id == model.lifestyle_id
    );

    if (!matchingLifestyle) {
      throw new Error(`Lifestyle with lifestyle_id ${model.lifestyle_id} not found`);
    }

    let lifeStyleDoc = await this.lifeStyleRepository.find({
      name: { $regex: new RegExp(`^${matchingLifestyle.name}$`, 'i') },
    });

    if (!lifeStyleDoc) {
      const lifestyleData: any = {
        name: matchingLifestyle.name,
        displayOrder: !isNaN(Number(matchingLifestyle.display_order))
          ? Number(matchingLifestyle.display_order)
          : undefined,
      };

      lifeStyleDoc = await this.lifeStyleRepository.create(lifestyleData);
    } else {
      lifeStyleDoc = await this.lifestyleModel.findByIdAndUpdate(
        lifeStyleDoc._id,
        {
          displayOrder: !isNaN(Number(matchingLifestyle.display_order))
            ? Number(matchingLifestyle.display_order)
            : undefined,
        },
        { new: true }
      );
    }

    return lifeStyleDoc;
  }

  private async getPlaceDetails(address: string) {
    const placeUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=place_id,geometry&key=${process.env.GOOGLE_PLACE_API_KEY}`;

    try {
      const response = await axios.get(placeUrl);

      if (response.data.candidates && response.data.candidates.length > 0) {
        const place = response.data.candidates[0];
        const placeId = place.place_id;
        const latitude = place.geometry.location.lat;
        const longitude = place.geometry.location.lng;
        return {
          placeId,
          latitude,
          longitude,
        };
      } else {
        return {
          placeId: null,
          latitude: null,
          longitude: null,
        };
      }
    } catch (error) {
      console.error(
        'Error fetching place details:',
        error.response ? error.response.data : error.message
      );
      return {
        placeId: null,
        latitude: null,
        longitude: null,
      };
    }
  }

  async processUploadedImages(file: Express.Multer.File) {
    console.log('Starting image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  private async processImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    try {
      console.log('Processing images in background:');

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheets = {
        residences: XLSX.utils.sheet_to_json(workbook.Sheets['Residences']),
        cities: XLSX.utils.sheet_to_json(workbook.Sheets['Cities']),
        countries: XLSX.utils.sheet_to_json(workbook.Sheets['Countries']),
      };

      console.log('Processing Residence Images...');
      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        console.log(
          `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.residences.length / BATCH_SIZE)}`
        );
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);

        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        for (const singleResidence of batch) {
          const residence = singleResidence as Residence;

          const mainGalleryPath = residence.main_gallery_path
            ? `${process.env.RESIDENCE_SEEDER_FOLDER}/${residence.main_gallery_path}/Main Gallery`
            : null;

          const secondGalleryPath = residence.second_gallery_path
            ? `${process.env.RESIDENCE_SEEDER_FOLDER}/${residence.second_gallery_path}/Second Gallery`
            : null;

          const [mainGalleryObjects, secondGalleryObjects] = await Promise.all([
            mainGalleryPath ? this.listS3Objects(mainGalleryPath) : [],
            secondGalleryPath ? this.listS3Objects(secondGalleryPath) : [],
          ]);

          const mainGalleryUploads = await this.createUploadRecords(mainGalleryObjects);
          const secondGalleryUploads = await this.createUploadRecords(secondGalleryObjects);

          if (mainGalleryUploads.length > 0 || secondGalleryUploads.length > 0) {
            const visualsUpdate: any = {
              visuals: {},
            };

            if (mainGalleryUploads.length > 0) {
              visualsUpdate.visuals.mainPhotos = [mainGalleryUploads[0]?._id];
              visualsUpdate.visuals.mainGalleryPhotos = mainGalleryUploads.map(
                (upload) => upload._id
              );
            }

            if (secondGalleryUploads.length > 0) {
              visualsUpdate.visuals.secondGalleryPhotos = secondGalleryUploads.map(
                (upload) => upload._id
              );
            }

            const cityDoc = await this.processCity(residence, sheets.cities, sheets.countries);

            const residenceDoc = await this.residenceRepository.updateWithFilter(
              { name: residence.name, cityId: new Types.ObjectId(cityDoc._id), isDeleted: false },
              { $set: visualsUpdate }
            );

            await this.residenceDraftRepository.updateWithFilter(
              { residenceId: new Types.ObjectId(residenceDoc?.id) },
              { $set: visualsUpdate }
            );
          }
        }
      }

      console.log('Image processing completed:', file.originalname);
    } catch (error) {
      console.error('Error processing images:', file.originalname, error);
    }
  }

  private async listS3Objects(prefix: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: prefix + '/',
        MaxKeys: 1000,
      };

      const command = new ListObjectsV2Command(params);
      const response = await this.s3Client.send(command);

      return response.Contents || [];
    } catch (error) {
      console.error(`Error listing S3 objects for prefix ${prefix}:`, error);
      return [];
    }
  }

  private async createUploadRecords(s3Objects: any[]) {
    const uploads = [];

    for (const object of s3Objects) {
      try {
        const url = `https://${process.env.CDN_URL}/${object.Key}`;

        const uploadRecord = {
          originalFileKey: object.Key,
          size: object.Size,
          mimeType: this.getContentType(object.Key),
          url: url,
          fileKey: object.ETag,
          driver: 'S3',
        };

        const upload = await this.uploadRepository.create(uploadRecord);
        uploads.push(upload);
      } catch (error) {
        console.error(`Error creating upload record for ${object.Key}:`, error);
      }
    }

    return uploads;
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /// city
  async processCityImages(file: Express.Multer.File) {
    console.log('Starting city image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processCityImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processCityImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      cities: XLSX.utils.sheet_to_json(workbook.Sheets['Cities']),
    };

    console.log('Processing City Images...');
    for (let i = 0; i < sheets.cities.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.cities.length / BATCH_SIZE)}`
      );
      const batch = sheets.cities.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleCity of batch) {
        const city = singleCity as any;
        const uploadArray = [];

        try {
          // Process Home Page Image
          if (city.home_page_image) {
            const lastValue = city.home_page_image_path.split('/').pop();
            const homePagePath = `${lastValue}/${city.home_page_image}`;
            const homePageUpload = await this.processImage(homePagePath, 'home_page');
            if (homePageUpload) uploadArray.push(homePageUpload);
          }

          // Process Ranking Page General Image
          if (city.ranking_page_general_image) {
            const lastValue = city.ranking_page_general.split('/').pop();
            const rankingGeneralPath = `${lastValue}/${city.ranking_page_general_image}`;
            const rankingGeneralUpload = await this.processImage(
              rankingGeneralPath,
              'ranking_page_general'
            );
            if (rankingGeneralUpload) uploadArray.push(rankingGeneralUpload);
          }

          // Process Ranking Page Specific Image
          if (city.ranking_page_specific_image) {
            const lastValue = city.ranking_page_specific.split('/').pop();
            const rankingSpecificPath = `${lastValue}/${city.ranking_page_specific_image}`;
            const rankingSpecificUpload = await this.processImage(
              rankingSpecificPath,
              'ranking_page_specific'
            );
            if (rankingSpecificUpload) uploadArray.push(rankingSpecificUpload);
          }

          // Process Developer Page Image
          if (city.developer_page_image) {
            const lastValue = city.developer_page.split('/').pop();
            const developerPagePath = `${lastValue}/${city.developer_page_image}`;
            const developerPageUpload = await this.processImage(
              developerPagePath,
              'developer_page'
            );
            if (developerPageUpload) uploadArray.push(developerPageUpload);
          }

          // Update the database if any images were uploaded
          if (uploadArray.length > 0) {
            await this.cityModel.updateOne(
              { name: city.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for city ${city.name}:`, error);
        }
      }
    }
  }

  private async listS3Object(prefix: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 1,
      };

      const command = new ListObjectsV2Command(params);
      const response = await this.s3Client.send(command);

      return response.Contents || [];
    } catch (error) {
      console.error(`Error listing S3 object for prefix ${prefix}:`, error);
      return [];
    }
  }

  private async createUploadRecord(s3Object: any) {
    try {
      const url = `https://${process.env.CDN_URL}/${s3Object.Key}`;

      const uploadRecord = {
        originalFileKey: s3Object.Key,
        size: s3Object.Size,
        mimeType: this.getContentType(s3Object.Key),
        url: url,
        fileKey: s3Object.ETag,
        driver: 'S3',
      };

      return await this.uploadRepository.create(uploadRecord);
    } catch (error) {
      console.error(`Error creating upload record for ${s3Object.Key}:`, error);
      return null;
    }
  }

  // countries
  async processCountryImages(file: Express.Multer.File) {
    console.log('Starting country image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processCountryImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processCountryImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      countries: XLSX.utils.sheet_to_json(workbook.Sheets['Countries']),
    };

    console.log('Processing Country Images...');
    for (let i = 0; i < sheets.countries.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.countries.length / BATCH_SIZE)}`
      );
      const batch = sheets.countries.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleCountry of batch) {
        const country = singleCountry as any;
        const uploadArray = [];

        try {
          // Process Logo Image
          if (country.logo) {
            const lastValue = country.logo_path.split('/').pop();
            const logoPath = `${lastValue}/${country.logo}`;
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process Ranking Page General Image
          if (country.ranking_page_general_image) {
            const lastValue = country.ranking_page_general.split('/').pop();
            const rankingGeneralPath = `${lastValue}/${country.ranking_page_general_image}`;
            const rankingGeneralUpload = await this.processImage(
              rankingGeneralPath,
              'ranking_page_general'
            );
            if (rankingGeneralUpload) uploadArray.push(rankingGeneralUpload);
          }

          // Process Ranking Page Specific Image
          if (country.ranking_page_specific_image) {
            const lastValue = country.ranking_page_specific.split('/').pop();
            const rankingSpecificPath = `${lastValue}/${country.ranking_page_specific_image}`;
            const rankingSpecificUpload = await this.processImage(
              rankingSpecificPath,
              'ranking_page_specific'
            );
            if (rankingSpecificUpload) uploadArray.push(rankingSpecificUpload);
          }

          // Update the database if any images were uploaded
          if (uploadArray.length > 0) {
            await this.countryModel.updateOne(
              { name: country.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for country ${country.name}:`, error);
        }
      }
    }
  }

  //PropertyType

  async processPropertyTypeImages(file: Express.Multer.File) {
    console.log('Starting Property Type image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processPropertyTypeImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processPropertyTypeImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      propertyTypes: XLSX.utils.sheet_to_json(workbook.Sheets['PropertyTypes']),
    };

    console.log('Processing Property Type Images...');
    for (let i = 0; i < sheets.propertyTypes.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.propertyTypes.length / BATCH_SIZE)}`
      );
      const batch = sheets.propertyTypes.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singlePropertyType of batch) {
        const propertyType = singlePropertyType as any;
        const uploadArray = [];

        try {
          // Process Logo Image
          if (propertyType.logo) {
            const lastValue = propertyType.logo_path.split('/').pop();
            const logoPath = `${lastValue}/${propertyType.logo}`;
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process Developer Page Image
          if (propertyType.developer_page_image) {
            const lastValue = propertyType.developer_page.split('/').pop();
            const developerPagePath = `${lastValue}/${propertyType.developer_page_image}`;
            const developerPageUpload = await this.processImage(
              developerPagePath,
              'developer_page'
            );
            if (developerPageUpload) uploadArray.push(developerPageUpload);
          }

          // Process Ranking Page Specific Image
          if (propertyType.ranking_page_specific_image) {
            const lastValue = propertyType.ranking_page_specific.split('/').pop();
            const rankingSpecificPath = `${lastValue}/${propertyType.ranking_page_specific_image}`;
            const rankingSpecificUpload = await this.processImage(
              rankingSpecificPath,
              'ranking_page_specific'
            );
            if (rankingSpecificUpload) uploadArray.push(rankingSpecificUpload);
          }

          // Update the database if any images were uploaded
          if (uploadArray.length > 0) {
            await this.propertyTypeRepository.updateWithFilter(
              { name: propertyType.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for property type ${propertyType.name}:`, error);
        }
      }
    }
  }

  ///Lifestyle

  async processLifestyleImages(file: Express.Multer.File) {
    console.log('Starting Lifestyle image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processLifestyleImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processLifestyleImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      lifestyles: XLSX.utils.sheet_to_json(workbook.Sheets['Lifestyles']),
    };

    console.log('Processing Lifestyle Images...');
    for (let i = 0; i < sheets.lifestyles.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.lifestyles.length / BATCH_SIZE)}`
      );
      const batch = sheets.lifestyles.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleLifestyle of batch) {
        const lifestyle = singleLifestyle as any;
        const uploadArray = [];

        try {
          // Process Logo Image
          if (lifestyle.logo) {
            const lastValue = lifestyle.image_path.split('/').pop();
            const logoPath = `${lastValue}/${lifestyle.logo}`;
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process Developer Page Image
          if (lifestyle.developer_page_image) {
            const lastValue = lifestyle.developer_page.split('/').pop();
            const developerPagePath = `${lastValue}/${lifestyle.developer_page_image}`;
            const developerPageUpload = await this.processImage(
              developerPagePath,
              'developer_page'
            );
            if (developerPageUpload) uploadArray.push(developerPageUpload);
          }

          // Process Ranking Page Specific Image
          if (lifestyle.ranking_page_specific_image) {
            const lastValue = lifestyle.ranking_page_specific.split('/').pop();
            const rankingSpecificPath = `${lastValue}/${lifestyle.ranking_page_specific_image}`;
            const rankingSpecificUpload = await this.processImage(
              rankingSpecificPath,
              'ranking_page_specific'
            );
            if (rankingSpecificUpload) uploadArray.push(rankingSpecificUpload);
          }

          // Update the database if any images were uploaded
          if (uploadArray.length > 0) {
            await this.lifeStyleRepository.updateWithFilter(
              { name: lifestyle.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for lifestyle ${lifestyle.name}:`, error);
        }
      }
    }
  }

  async processRankingCategoryImages(file: Express.Multer.File) {
    console.log('Starting Ranking Category image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processRankingImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }
  async processRankingImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      rankingCategories: XLSX.utils.sheet_to_json(workbook.Sheets['RankingCategories']),
    };

    console.log('Processing Ranking Category Images...');
    for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.rankingCategories.length / BATCH_SIZE)}`
      );
      const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleRankingCategory of batch) {
        const rankingCategory = singleRankingCategory as any;

        if (rankingCategory.image && rankingCategory.image_path) {
          const lastValue = rankingCategory.image_path.split('/').filter(Boolean).pop();
          const imagePath = `${lastValue}/${rankingCategory.image}`.trim();

          try {
            const s3Object = await this.listS3Object(imagePath);

            if (s3Object.length > 0) {
              const uploadRecord = await this.createUploadRecord(s3Object[0]);

              if (uploadRecord) {
                await this.rankingCategoryRepository.updateWithFilter(
                  { title: rankingCategory.title, isDeleted: false },
                  {
                    $set: {
                      upload: [
                        {
                          ImageId: uploadRecord._id,
                          type: 'Picture',
                        },
                      ],
                    },
                  }
                );
              }
            }
          } catch (error) {
            console.error(`Error processing image for lifestyle ${rankingCategory.title}:`, error);
          }
        }
      }
    }
  }

  //geographicalareas

  async processGeographicalAreaImages(file: Express.Multer.File) {
    console.log('Starting Geographical Area image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processGeographicalAreaImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processGeographicalAreaImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      geographicalAreas: XLSX.utils.sheet_to_json(workbook.Sheets['GeographicalArea']),
    };

    console.log('Processing Geographical Area Images...');
    for (let i = 0; i < sheets.geographicalAreas.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.geographicalAreas.length / BATCH_SIZE)}`
      );
      const batch = sheets.geographicalAreas.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleArea of batch) {
        const geographicalArea = singleArea as any;
        const uploadArray = [];

        try {
          // Process Logo Image
          if (geographicalArea.logo) {
            const lastValue = geographicalArea.logo_path.split('/').pop();
            const logoPath = `${lastValue}/${geographicalArea.logo}`;
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process Developer Page Image
          if (geographicalArea.developer_page_image) {
            const lastValue = geographicalArea.developer_page.split('/').pop();
            const developerPagePath = `${lastValue}/${geographicalArea.developer_page_image}`;
            const developerPageUpload = await this.processImage(
              developerPagePath,
              'developer_page'
            );
            if (developerPageUpload) uploadArray.push(developerPageUpload);
          }

          // Process Ranking Page General Image
          if (geographicalArea.ranking_page_general_image) {
            const lastValue = geographicalArea.ranking_page_general.split('/').pop();
            const rankingGeneralPath = `${lastValue}/${geographicalArea.ranking_page_general_image}`;
            const rankingGeneralUpload = await this.processImage(
              rankingGeneralPath,
              'ranking_page_general'
            );
            if (rankingGeneralUpload) uploadArray.push(rankingGeneralUpload);
          }

          // Process Ranking Page Specific Image
          if (geographicalArea.ranking_page_specific_image) {
            const lastValue = geographicalArea.ranking_page_specific.split('/').pop();
            const rankingSpecificPath = `${lastValue}/${geographicalArea.ranking_page_specific_image}`;
            const rankingSpecificUpload = await this.processImage(
              rankingSpecificPath,
              'ranking_page_specific'
            );
            if (rankingSpecificUpload) uploadArray.push(rankingSpecificUpload);
          }

          // Update the database if any images were uploaded
          if (uploadArray.length > 0) {
            await this.geographicalAreasRepository.updateWithFilter(
              { name: geographicalArea.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(
            `Error processing images for geographical area ${geographicalArea.name}:`,
            error
          );
        }
      }
    }
  }

  // brand
  async processBrandImages(file: Express.Multer.File) {
    console.log('Starting Brand image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processBrandImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }
  async processBrandImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      brands: XLSX.utils.sheet_to_json(workbook.Sheets['Brands']),
    };

    console.log('Processing Brand Images...');
    for (let i = 0; i < sheets.brands.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.brands.length / BATCH_SIZE)}`
      );
      const batch = sheets.brands.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleBrand of batch) {
        const brand = singleBrand as any;
        const uploadArray = [];

        try {
          // Process logo image
          if (brand.logo) {
            const lastValue = brand.logo_path.split('/').pop();
            const logoPath = `${lastValue}/${brand.logo}`.trim();
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process logo directory image
          if (brand.directory_logo) {
            const lastValue = brand.directory_logo_path.split('/').pop();
            const logoDirectoryPath = `${lastValue}/${brand.directory_logo}`;
            const logoDirectoryUpload = await this.processImage(logoDirectoryPath, 'logoDirectory');
            if (logoDirectoryUpload) uploadArray.push(logoDirectoryUpload);
          }

          // Process preview image
          if (brand.preview_image) {
            const lastValue = brand.preview_image_path.split('/').pop();
            const previewPath = `${lastValue}/${brand.preview_image}`;
            const previewUpload = await this.processImage(previewPath, 'preview');
            if (previewUpload) uploadArray.push(previewUpload);
          }

          // Process background image
          if (brand.backgroung_image) {
            const lastValue = brand.backgroung_image_path.split('/').pop();
            const backgroundPath = `${lastValue}/${brand.backgroung_image}`;
            const backgroundUpload = await this.processImage(backgroundPath, 'backgroundImage');
            if (backgroundUpload) uploadArray.push(backgroundUpload);
          }

          // Update brand document if any images were processed
          if (uploadArray.length > 0) {
            await this.brandRepository.updateWithFilter(
              { name: brand.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for brand ${brand.name}:`, error);
        }
      }
    }
  }

  // amenities
  async processAmenitiesImages(file: Express.Multer.File) {
    console.log('Starting Amenities image processing:', file.originalname);

    // Return immediately that processing has started
    setTimeout(() => {
      this.processAmenitiesImagesInBackground(file);
    }, 0);

    return {
      success: true,
      message: 'Image processing started',
    };
  }

  async processAmenitiesImagesInBackground(file: Express.Multer.File) {
    const BATCH_SIZE = 10;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = {
      amenities: XLSX.utils.sheet_to_json(workbook.Sheets['Amenities']),
    };

    console.log('Processing Amenities Images...');
    for (let i = 0; i < sheets.amenities.length; i += BATCH_SIZE) {
      console.log(
        `Processing Images batch ${i / BATCH_SIZE + 1} of ${Math.ceil(sheets.amenities.length / BATCH_SIZE)}`
      );
      const batch = sheets.amenities.slice(i, i + BATCH_SIZE);

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      for (const singleAmenity of batch) {
        const amenity = singleAmenity as any;
        const uploadArray = [];

        try {
          // Process logo image
          if (amenity.logo_image) {
            const lastValue = amenity.icon_path.split('/').pop();
            const logoPath = `${lastValue}/${amenity.logo_image}`.trim();
            const logoUpload = await this.processImage(logoPath, 'logo');
            if (logoUpload) uploadArray.push(logoUpload);
          }

          // Process first image
          if (amenity.image1) {
            const lastValue = amenity.image_path.split('/').pop();
            const image1Path = `${lastValue}/${amenity.image1}`;
            const image1Upload = await this.processImage(image1Path, 'image1');
            if (image1Upload) uploadArray.push(image1Upload);
          }

          // Process second image
          if (amenity.image2) {
            const lastValue = amenity.image_path.split('/').pop();
            const image2Path = `${lastValue}/${amenity.image2}`;
            const image2Upload = await this.processImage(image2Path, 'image2');
            if (image2Upload) uploadArray.push(image2Upload);
          }

          // Update amenity document if any images were processed
          if (uploadArray.length > 0) {
            await this.amenityRepository.updateWithFilter(
              { name: amenity.name, isDeleted: false },
              {
                $set: {
                  upload: uploadArray,
                },
              }
            );
          }
        } catch (error) {
          console.error(`Error processing images for amenity ${amenity.name}:`, error);
        }
      }
    }
  }

  private async processImage(imagePath: string, imageType: string) {
    try {
      const s3Object = await this.listS3Object(imagePath);

      if (s3Object.length > 0) {
        const uploadRecord = await this.createUploadRecord(s3Object[0]);

        if (uploadRecord) {
          return {
            ImageId: uploadRecord._id,
            type: imageType,
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Error processing ${imageType} image at path ${imagePath}:`, error);
      return null;
    }
  }

  private createRankingCategoryData(
    rankingCategory: any,
    data: {
      doc: any;
      mappedCategoryType: string;
      criteria: any[];
      foundIdField: string;
    }
  ) {
    const baseData: any = {
      isDeleted: false,
      status: RankingCategoryStatus.ACTIVE,
      totalRequests: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Handle basic fields
    if (rankingCategory.title?.toString().trim()) {
      baseData.title = rankingCategory.title;
    }

    if (rankingCategory.description?.toString().trim()) {
      baseData.description = rankingCategory.description;
    }

    // Handle category type
    if (data.mappedCategoryType) {
      baseData.categoryType = data.mappedCategoryType;
    }

    // Handle residence limitation
    if (rankingCategory.residence_limitation?.toString().trim()) {
      const residenceLimitation = Number(rankingCategory.residence_limitation);
      if (!isNaN(residenceLimitation)) {
        baseData.residenceLimitation = residenceLimitation;
      }
    }

    // Handle ranking price
    if (rankingCategory.ranking_price?.toString().trim()) {
      const price = Number(rankingCategory.ranking_price);
      if (!isNaN(price)) {
        baseData.price = price;
      }
    }

    // Handle display order
    if (rankingCategory.display_order?.toString().trim()) {
      const displayOrder = Number(rankingCategory.display_order);
      if (!isNaN(displayOrder)) {
        baseData.displayOrder = displayOrder;
      }
    }

    // Handle criteria
    if (data.criteria?.length > 0) {
      baseData.criteria = data.criteria;
    }

    // Handle document ID reference
    if (data.doc?._id && data.foundIdField) {
      baseData[this.getSchemaField(data.foundIdField)] = new Types.ObjectId(data.doc._id);
    }

    return baseData;
  }
}
