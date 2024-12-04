import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { City } from 'src/city/schema/city.schema';
import { ResidenceType } from 'src/residenceType/schema/residenceType.schema';
import { ResidenceRepository } from './residences.repository';
import * as XLSX from 'xlsx';
import { Country } from 'src/country/schema/country.schema';
// import { ResidenceStatus } from './enum/residence-enum';
import * as path from 'path';
import * as fs from 'fs';
import * as FormData from 'form-data';
import * as mime from 'mime-types';
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

interface RankingCategory {
  ranking_category_id: string;
  image_path?: string;
  title: string;
  description?: string;
  category_type: string;
  residence_limitation?: string;
  ranking_price?: number;
  geographical_area_id?: string;
  country_id?: string;
  city_id?: string;
  lifestyle_id?: string;
  brand_id?: string;
  property_type_id?: string;
  criteria_id1?: string;
  criteria_id2?: string;
  criteria_id3?: string;
  criteria_id4?: string;
  criteria_id5?: string;
  criteria_id6?: string;
}

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
    @InjectModel(City.name)
    private readonly cityModel: Model<City>,
    @InjectModel(ResidenceType.name)
    private readonly residenceTypeModel: Model<ResidenceType>,
    @InjectModel(Country.name)
    private readonly countryModel: Model<Country>
  ) {}

  async processUploadedFile(file: Express.Multer.File) {
    const BATCH_SIZE = 10;
    const errors = {
      rankingCategories: [],
      residences: [],
    };

    try {
      await this.residenceRepository.updateMany({}, { $set: { isDeleted: true } });

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

      for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
       
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
        }
      
        const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (rankingCategory) => {
            try {
              
              await new Promise(resolve => setTimeout(resolve, 500)); 
      
              const rankingCategoryTyped = rankingCategory as RankingCategory;
              let criteria;
      
              if (
                rankingCategoryTyped.criteria_id1 ||
                rankingCategoryTyped.criteria_id2 ||
                rankingCategoryTyped.criteria_id3 ||
                rankingCategoryTyped.criteria_id4 ||
                rankingCategoryTyped.criteria_id5 ||
                rankingCategoryTyped.criteria_id6
              ) {
                criteria = await this.processCriteria(
                  rankingCategoryTyped,
                  sheets.rankingCriterias
                );
              }
             
              const idFields = [
                'country_id',
                'city_id',
                'lifestyle_id',
                'brand_id',
                'property_type_id',
                'geographical_area_id',
              ];
              const foundIdField = idFields.find((field) => rankingCategoryTyped[field] != null);
             
              if (!foundIdField) {
                throw new Error(
                  `No valid ID field found for rankingCategory: ${rankingCategoryTyped.title}`
                );
              }
      
              const categoryType = foundIdField.replace('_id', '');
              const mappedCategoryType = categoryTypeMapping[categoryType];
      
              if (!mappedCategoryType) {
                throw new Error(`Invalid category type mapping for: ${categoryType}`);
              }
      
              const doc = await this.processCategoryType(categoryType, rankingCategoryTyped, {
                countries: sheets.countries,
                cities: sheets.cities,
                lifestyles: sheets.lifestyles,
                brands: sheets.brands,
                propertyTypes: sheets.propertyTypes,
                geographicalType: sheets.geographicalArea,
                brandCategories: sheets.brandCategories
              });
      
              const rankingCategoryData = {
                title: rankingCategoryTyped.title,
                description: rankingCategoryTyped?.description || '',
                categoryType: mappedCategoryType,
                residenceLimitation: rankingCategoryTyped?.residence_limitation || null,
                price: rankingCategoryTyped?.ranking_price || null,
                criteria: criteria || [],
                status: RankingCategoryStatus.ACTIVE,
                isDeleted: false,
                totalRequests: 0,
                [this.getSchemaField(foundIdField)]: new Types.ObjectId(doc._id),
              };
              await this.rankingCategoryRepository.create(rankingCategoryData);
            } catch (error) {
              errors.rankingCategories.push({
                id: (rankingCategory as RankingCategory).ranking_category_id,
                name: (rankingCategory as RankingCategory).title,
                error: error.message,
              });
            }
          })
        );
      }

      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);
        
        // Add delay between batches
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
        }
      
        await Promise.all(
          batch.map(async (singleResidence) => {
            try {
              const residence = singleResidence as Residence;
              
              // Add small delay between individual items in batch
              await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      
              const promises = [
                // Required promises first
                this.processResidence(residence, sheets.residenceTypes),
                this.processBrand(residence, sheets.brands, sheets.brandCategories),
                this.processCity(residence, sheets.cities, sheets.countries),
                this.processCountry(residence, sheets.countries),
                
                // Optional promises in fixed order
                residence.lifestyle_id 
                  ? this.processLifestyle(residence, sheets.lifestyles)
                  : Promise.resolve(null),
                  
                residence.address
                  ? this.getPlaceDetails(residence.address)
                  : Promise.resolve(null),
                  
                Object.keys(residence).some((key) => key.startsWith('feature_id'))
                  ? this.processResidenceFeature(residence, sheets.residenceFeatures)
                  : Promise.resolve(null),
                  
                (residence.main_photo || residence.main_gallery_path || residence.second_gallery_path)
                  ? this.processVisuals(residence)
                  : Promise.resolve(null),
                  
                residence.amenity_ids
                  ? this.processAmenity(residence, sheets.amenities)
                  : Promise.resolve(null),
                  
                (residence.highlighted_amenity_id1 || residence.highlighted_amenity_id2 || residence.highlighted_amenity_id3)
                  ? this.findAmenities(residence, sheets.amenities)
                  : Promise.resolve(null),
                  
                this.processResidenceScores(residence, sheets.rankingCategories, sheets.residenceScores)
              ];
      
              const [
                residenceTypeDoc,   
                brandDoc,          
                cityDoc,           
                countryDoc,        
                lifeStyleDoc,      
                placeDetails,      
                residenceFeatureIds, 
                visuals,           
                amenityIds,        
                highlightedAmenities, 
                rankingScoreDocArray  
              ] = await Promise.all(promises);
      
              const residenceData = this.createResidenceData(residence, {
                residenceTypeDoc,
                brandDoc,
                residenceFeatureIds: residenceFeatureIds || [],
                cityDoc,
                countryDoc,
                amenityIds: amenityIds || [],
                highlightedAmenities: highlightedAmenities || [],
                lifeStyleDoc,
                visuals: visuals || {},
                placeDetails: placeDetails || {},
              });
      
              await this.residenceRepository.create(residenceData);
             
              if (rankingScoreDocArray?.length) {
                await this.rankingRequestRepository.createMany(rankingScoreDocArray);
              }
            } catch (error) {
              errors.residences.push({
                id: (singleResidence as Residence).residence_id,
                name: (singleResidence as Residence).name,
                error: error.message,
              });
            }
          })
        );
      }

      return {
        success: true,
        errors,
      };
    } catch (error) {
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
      visuals: any;
      placeDetails: any;
    }
  ) {

    return {
      name: residence.name,
      residenceTypeIds: [new Types.ObjectId(data.residenceTypeDoc._id)],
      websiteLink: residence.website_link || undefined,
      associatedBrandId: data.brandDoc ? new Types.ObjectId(data.brandDoc._id) : undefined,
      placeId: data.placeDetails?.placeId,
      briefOverview: {
        subtitle: residence.subtitle,
        briefDescription: residence.brief_description,
      },
      comprehensiveOverview: {
        subtitle: residence.subtitle,
        generalDescription: residence.general_description,
        community: residence.community,
        recentRenovation: residence.recent_renovation,
        localAttractions: residence.local_attractions,
        futureDevelopmentPlans: residence.future_development,
      },
      budgetLimitationsRange: {
        startRange: Number(residence.start_range),
        endRange: Number(residence.end_range),
      },
      residenceKeyFeatures: {
        featureIds: data.residenceFeatureIds,
        developmentInfo: {
          yearOfBuild: Number(residence.build_year),
          rentalPotential: residence.rental_potential,
          developmentStatus: residence.development_status,
        },
        petPolicy: residence.pet_policy,
      },
      visuals: data.visuals,
      nearbyAmenities: {
        amenitiesList: data.amenityIds || [],
        highlightedAmenities: data.highlightedAmenities || [],
      },
      status: 'active',
      cityId: new Types.ObjectId(data.cityDoc._id),
      countryId: new Types.ObjectId(data.countryDoc._id),
      lifeStyleId: data.lifeStyleDoc ? new Types.ObjectId(data.lifeStyleDoc._id) : undefined,
      address: {
        country: data.countryDoc.name,
        state: residence.state,
        city: data.cityDoc.name,
        userInput: residence.address,
        location: {
          lat: data.placeDetails?.latitude,
          lng: data.placeDetails?.longitude,
        },
        placeId: data.placeDetails?.placeId,
      },
      isDeleted: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async processResidenceScores(
    residence: Residence,
    rankingCategories: any[],
    residenceScores: any[]
) {
    try {
        const matchingScores = residenceScores.filter(
            (score) => score.residence_id == residence.residence_id
        );

        const processedScores = [];

        for (const score of matchingScores) {
            const rankingCategory = rankingCategories.find(
                (rc) => rc.ranking_category_id === score.ranking_category_id
            );

            if (!rankingCategory) continue;

            const criteriaScores = [];
            for (let i = 1; i <= 6; i++) {
                const criteriaFeedback = score[`criteria${i}_feedback`];
                const criteriaScore = score[`criteria${i}_score`];
                const criteriaId = rankingCategory[`criteria_id${i}`];

                // Only add if all required fields are present
                if (criteriaFeedback && criteriaScore && criteriaId) {
                    criteriaScores.push({
                        criteriaId: new Types.ObjectId(criteriaId),
                        score: Number(criteriaScore),
                        description: criteriaFeedback
                    });
                }
            }

            const residenceScoreDoc = {
                rankingCategoryId: new Types.ObjectId(rankingCategory._id),
                residenceId: new Types.ObjectId(residence.residence_id),
                paymentStatus: PaymentStatus.PAID,
                upload: [],
                status: RankingRequestStatus.ACTIVE,
                isDeleted: false,
                criteriaScores,
                bbrScore: Number(score.bbr_score),
                createdAt: new Date(),
                updatedAt: new Date()
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
        return await this.processBrand(rankingCategory, dataSources.brands, dataSources.brandCategories);
      case 'property_type':
        return await this.processProperty(rankingCategory, dataSources.propertyTypes);
      case 'geographical_area':
        return await this.processGeographicalArea(rankingCategory, dataSources.geographicalType);
      default:
        throw new Error(`Unsupported category type: ${categoryType}`);
    }
  }

  private async processProperty(model: any, properties: any[]) {
    const matchingPropertyType = properties.find(
      (property) => property.property_id === model.property_id
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
      };

      if (
        matchingPropertyType.image_path &&
        matchingPropertyType.image_path.trim() !== '' &&
        matchingPropertyType.image_path !== '""'
      ) {
        const imagePath = matchingPropertyType.image_path.replace(/^"|"$/g, '').trim();
        const imagesArray = imagePath.includes(',')
          ? imagePath.split(',').map((path) => path.trim())
          : [imagePath];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);

        propertyData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        }));
      }

      propertyTypeDoc = await this.propertyTypeRepository.create(propertyData);
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
      };

      if (
        matchingArea.image_path &&
        matchingArea.image_path.trim() !== '' &&
        matchingArea.image_path !== '""'
      ) {
        const imagePath = matchingArea.image_path.replace(/^"|"$/g, '').trim();
        const imagesArray = imagePath.includes(',')
          ? imagePath.split(',').map((path) => path.trim())
          : [imagePath];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);

        areaData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        }));
      }

      geographicalAreaDoc = await this.geographicalAreasRepository.create(areaData);
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

      if (
        matchingResidenceType.images_path &&
        matchingResidenceType.images_path.trim() !== '' &&
        matchingResidenceType.images_path !== '""'
      ) {
        const imagePath = matchingResidenceType.images_path.replace(/^"|"$/g, '').trim();
        const imagesArray = imagePath.includes(',')
          ? imagePath.split(',').map((path) => path.trim())
          : [imagePath];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);

        residenceData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        }));
      }

      residenceTypeDoc = await this.residenceTypeModel.create(residenceData);
    }
    return residenceTypeDoc;
  }

  private async processBrand(model: any, brands: any[], brandCategories: any[]): Promise<any> {
    const matchingBrand = brands.find((brand) => brand.brand_id == model.brand_id);
   
    if (!matchingBrand) {
      this.logger.error(`Brand not found for residence: ${model.brand_id}`);
      return null;
    }

    const imageFields = [
      { key: 'image1_path', type: 'logo' },
      { key: 'image2_path', type: 'logoDirectory' },
      { key: 'image3_path', type: 'preview' },
      { key: 'image4_path', type: 'backgroundImage' },
    ];

    let brandDoc = await this.brandRepository.find({
      name: { $regex: new RegExp(`^${matchingBrand.name}$`, 'i') },
    });


    if (!brandDoc) {
      const brandData: any = {
        name: matchingBrand.name,
        description: matchingBrand.description || '',
        registeredDate: new Date(),
        status: 'active',
        brandCategoryId: await this.processBrandCategory(matchingBrand, brandCategories),
      };

      const uploadImages = imageFields
        .filter(
          (field) =>
            matchingBrand[field.key] &&
            matchingBrand[field.key].trim() !== '' &&
            matchingBrand[field.key] !== '""'
        )
        .map((field) => ({
          path: matchingBrand[field.key].replace(/^"|"$/g, '').trim(),
          type: field.type,
        }));


      if (uploadImages.length > 0) {
        const imageIds = await this.uploadImagesAndGetIds(uploadImages.map((image) => image.path));
        brandData.upload = imageIds.map((id, index) => ({
          ImageId: new Types.ObjectId(id),
          type: uploadImages[index].type,
        }));
      }
      brandDoc = await this.brandRepository.create(brandData);
      
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

    let brandCategoryDoc = await this.brandCategoryRepository.find({
      name: { $regex: new RegExp(`^${matchingBrandCategory.name}$`, 'i') },
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

        if (matchingResidenceFeature.image_path) {
          const imagePath = matchingResidenceFeature.image_path.replace(/^"|"$/g, '').trim();
          if (imagePath && imagePath !== '""') {
            const imagesArray = imagePath.includes(',')
              ? imagePath.split(',').map((path) => path.trim())
              : [imagePath];

            const imageIds = await this.uploadImagesAndGetIds(imagesArray);

            featureData.upload = imageIds.map((id) => ({
              ImageId: new Types.ObjectId(id),
            }));
          }
        }

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
      name: { $regex: new RegExp(`^${matchingCity.name}$`, 'i') },
    };

    if (countryId) {
      searchQuery.countryId = new Types.ObjectId(countryId);
    }

    cityDoc = await this.cityModel.findOne(searchQuery);

    if (!cityDoc) {
      const cityData: any = {
        name: matchingCity.name,
      };

      if (countryId) {
        cityData.countryId = new Types.ObjectId(countryId);
      }

      if (matchingCity.logo) {
        const imagesArray = matchingCity.logo.includes(',')
          ? matchingCity.logo.split(',').map((path) => path.trim())
          : [matchingCity.logo.trim()];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);

        cityData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        }));
      }

      cityDoc = await this.cityModel.create(cityData);
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
      name: { $regex: new RegExp(`^${matchingCountry.name}$`, 'i') },
    });

    if (!countryDoc) {
      const countryData: any = {
        name: matchingCountry.name,
      };

      if (matchingCountry.logo) {
        const imagesArray = matchingCountry.logo.includes(',')
          ? matchingCountry.logo.split(',').map((path) => path.trim())
          : [matchingCountry.logo.trim()];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);

        countryData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'logo',
        }));
      }

      countryDoc = await this.countryModel.create(countryData);
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

        if (matchingAmenity.logo_image) {
          const imagePath = matchingAmenity.logo_image.replace(/^"|"$/g, '').trim();
          if (imagePath && imagePath !== '""') {
            const imagesArray = imagePath.includes(',')
              ? imagePath.split(',').map((path) => path.trim())
              : [imagePath];

            const imageIds = await this.uploadImagesAndGetIds(imagesArray);

            amenityData.upload = imageIds.map((id) => ({
              ImageId: new Types.ObjectId(id),
              type: 'logo',
            }));
          }
        }

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
    
      const amenityDoc = await this.amenityRepository.find({name: matchingAmenity.name});

      if (!amenityDoc) {
        continue;
      }
      const highlightedAmenity: any = {
        amenityId: amenityDoc._id,
      };

      // Add description if exists
      if (residence[`highlighted_amenity_description${i}`]) {
        highlightedAmenity.generalDescription = residence[`highlighted_amenity_description${i}`];
      }

      // Process image if exists
      if (residence[`highlighted_amenity_image_path${i}`]) {
        const imagePath = residence[`highlighted_amenity_image_path${i}`]
          .replace(/^"|"$/g, '')
          .trim();
        if (imagePath && imagePath !== '""') {
          const imageIds = await this.uploadImagesAndGetIds([imagePath]);
          if (imageIds.length > 0) {
            highlightedAmenity.imageId = imageIds[0];
          }
        }
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
      };

      if (matchingLifestyle.image_path) {
        const imagePath = matchingLifestyle.image_path.replace(/^"|"$/g, '').trim();
        const imageIds = await this.uploadImagesAndGetIds(
          imagePath.includes(',') ? imagePath.split(',').map((path) => path.trim()) : [imagePath]
        );

        lifestyleData.upload = imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        }));
      }

      lifeStyleDoc = await this.lifeStyleRepository.create(lifestyleData);
    }
 
    return lifeStyleDoc;
  }

  private async processVisuals(residence: any) {
    const processGalleryImages = async (
      galleryPath: string,
      imagesString: string,
      galleryType: string
    ) => {
      // Return empty array if either path or images are missing
      if (!galleryPath?.trim() || !imagesString?.trim()) return [];

      try {
        const basePath = `All Residences 01-117/${galleryPath.trim()}/${galleryType}`;
        const images = imagesString
          .replace(/^'|'$/g, '')
          .trim()
          .split(',')
          .map((img) => img.trim());

        const fullPaths = images.map((img) => `${basePath}/${img}`);
        return await this.uploadImagesAndGetIds(fullPaths);
      } catch (error) {
        console.error(`Error processing ${galleryType}:`, error);
        return [];
      }
    };

    const processMainPhoto = async (galleryPath: string) => {
      // Return empty array if either path or main photo is missing
      if (!galleryPath?.trim() || !residence.main_photo?.trim()) return [];

      try {
        const mainPhotoPath = `All Residences/Residences/${galleryPath.trim()}/Main Photo/${residence.main_photo.trim()}`;
        return await this.uploadImagesAndGetIds([mainPhotoPath]);
      } catch (error) {
        console.error('Error processing main photo:', error);
        return [];
      }
    };


    const [mainGalleryPhotos, secondGalleryPhotos, mainPhotos] = await Promise.all([
      residence.main_gallery_path && residence.main_gallery_images
        ? processGalleryImages(
            residence.main_gallery_path,
            residence.main_gallery_images,
            'Main Gallery'
          )
        : Promise.resolve([]),
      residence.second_gallery_path && residence.second_gallery_images
        ? processGalleryImages(
            residence.second_gallery_path,
            residence.second_gallery_images,
            'Second Gallery'
          )
        : Promise.resolve([]),
      residence.main_gallery_path && residence.main_photo
        ? processMainPhoto(residence.main_gallery_path)
        : Promise.resolve([]),
    ]);

    return {
      ...(mainPhotos.length > 0 && { mainPhotos }),
      ...(mainGalleryPhotos.length > 0 && { mainGalleryPhotos }),
      ...(secondGalleryPhotos.length > 0 && { secondGalleryPhotos }),
    };
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

  private async uploadImagesAndGetIds(imagePaths: string[]): Promise<string[]> {
    const form = new FormData();

    imagePaths.forEach((file) => {

      const filePath = path.resolve(__dirname, '../../../../../src', file);
      form.append('files', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: mime.lookup(filePath) || 'image/png',
      });
    });

    try {
      const response = await axios.post('http://localhost:4001/upload', form, {
        headers: form.getHeaders(),
      });
      return response.data?.data?.files.map((upload) => upload._id) || [];
    } catch (uploadError) {
      this.logger.error(
        `Error uploading files from imagepath ${imagePaths}: ${uploadError.message}`
      );
      return [];
    }
  }
}
