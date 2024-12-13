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
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { UploadRepository } from 'src/upload/upload.repository';
import { StateRepository } from 'src/state/state.repository';
import { State } from 'src/state/schema/state.schema';

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

interface CityInterface {
  city_id: string;
  name: string;
  country_id: string;
  logo: string;
}

interface CountryInterface{
  logo:string
  name:string
}

interface PropertyTypeInterface{
  image_path: string;
  name:string;

}

interface LifeStyleInterface{
  image_path: string;
  name:string;
  
}

interface GeographicalAreasInterface{
  image_path: string;
  name:string;
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
    @InjectModel(City.name)
    private readonly cityModel: Model<City>,
    @InjectModel(ResidenceType.name)
    private readonly residenceTypeModel: Model<ResidenceType>,
    @InjectModel(Country.name)
    private readonly countryModel: Model<Country>,
    @InjectModel(State.name)
    private readonly stateModel: Model<State>,
    private readonly uploadRepository: UploadRepository,
    private readonly stateRepository: StateRepository,
  ) {

    this.s3Client = new S3Client({
      region: process.env.AWS_S3_BUCKET_REGION,
      ...(process.env.END_POINT && {
          endpoint: `https://${process.env.END_POINT}`,
          forcePathStyle: true 
      }),
      credentials: {
          accessKeyId: process.env.AWS_S3_USER_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_S3_USER_SECRET,
      },
  });
  }

  private readonly API_KEY = 'YOUR_API_KEY';
  private readonly BASE_URL = 'https://api.countrystatecity.in/v1';

  async processUploadedFile(file: Express.Multer.File) {
    const BATCH_SIZE = 10;
    const errors = {
      rankingCategories: [],
      residences: [],
    };

    try {
      

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

      for (let i = 0; i < sheets.countries.length; i += BATCH_SIZE) {
        const batch = sheets.countries.slice(i, i + BATCH_SIZE);
        
        
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      
        for (const singleCountry of batch) {
          try {
            const country = singleCountry as any;

            let countryDoc = await this.countryModel.findOne({
              name: { $regex: new RegExp(country.name, 'i') }
            });


            if (!countryDoc) {
              const countryData: any = {
                name: country.name,
              };
        
              countryDoc = await this.countryModel.create(countryData);
            }
      
          } catch (error) {
            errors.residences.push({
              id: (singleCountry as any).country_id,
              name: (singleCountry as any).name,
              error: error.message
            });
          }
        }
      }

      for (let i = 0; i < sheets.cities.length; i += BATCH_SIZE) {
        const batch = sheets.cities.slice(i, i + BATCH_SIZE);
        
        
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
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
              name: { $regex: new RegExp(city.name, 'i') }
            };
        
            if (countryId) {
              searchQuery.countryId = new Types.ObjectId(countryId);
            }
        
            cityDoc = await this.cityModel.findOne(searchQuery);
        
            if (!cityDoc) {
              const cityData: any = {
                name: city.name,
              };
        
              if (countryId) {
                cityData.countryId = new Types.ObjectId(countryId);
              }
        
        
              cityDoc = await this.cityModel.create(cityData);
            }
      
          } catch (error) {
            errors.residences.push({
              id: (singleCity as any).city_id,
              name: (singleCity as any).name,
              error: error.message
            });
          }
        }
      }

      for (let i = 0; i < sheets.brands.length; i += BATCH_SIZE) {
        const batch = sheets.brands.slice(i, i + BATCH_SIZE);
        
        
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      
        for (const singleBrand of batch) {
          try {
            const brand = singleBrand as any;
            
            let brandDoc = await this.brandRepository.find({
              name: { $regex: new RegExp(brand.name, 'i') }
            });


            if (!brandDoc) {
              const brandData: any = {
                name: brand.name,
                description: brand.description || '',
                registeredDate: new Date(),
                status: 'active',
                brandCategoryId: await this.processBrandCategory(brand, sheets.brandCategories),
              };
        
              brandDoc = await this.brandRepository.create(brandData);
              
            }
      
          } catch (error) {
            errors.residences.push({
              id: (singleBrand as any).Brand_id,
              name: (singleBrand as any).name,
              error: error.message
            });
          }
        }
      }

      for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
      
        const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);
        
        for (const rankingCategory of batch) {
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
              title: rankingCategoryTyped?.title || '',
              description: rankingCategoryTyped?.description || '',
              categoryType: mappedCategoryType,
              residenceLimitation: Number(rankingCategoryTyped?.residence_limitation) || null,
              price: Number(rankingCategoryTyped?.ranking_price) || null,
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
        }
      }

      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);
        
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      
        for (const singleResidence of batch) {
          try {
            const residence = singleResidence as Residence;
            
            await new Promise(resolve => setTimeout(resolve, 200));
      
            const residenceTypeDoc = await this.processResidence(residence, sheets.residenceTypes);
            
            const brandDoc = residence.brand_id ? await this.processBrand(residence, sheets.brands, sheets.brandCategories) : null;
            
            const cityDoc = await this.processCity(residence, sheets.cities, sheets.countries);
            const countryDoc = await this.processCountry(residence, sheets.countries);
            await new Promise(resolve => setTimeout(resolve, 100));
            const lifeStyleDoc = residence.lifestyle_id 
              ? await this.processLifestyle(residence, sheets.lifestyles)
              : null;
              
            const placeDetails = residence.address
              ? await this.getPlaceDetails(residence.address)
              : null;
              
            const residenceFeatureIds = Object.keys(residence).some(key => key.startsWith('feature_id'))
              ? await this.processResidenceFeature(residence, sheets.residenceFeatures)
              : [];
              await new Promise(resolve => setTimeout(resolve, 100));
              
            const amenityIds = residence.amenity_ids
              ? await this.processAmenity(residence, sheets.amenities)
              : [];
              await new Promise(resolve => setTimeout(resolve, 100));
            const highlightedAmenities = (residence.highlighted_amenity_id1 || residence.highlighted_amenity_id2 || residence.highlighted_amenity_id3)
              ? await this.findAmenities(residence, sheets.amenities)
              : [];
              
            const rankingScoreDocArray = await this.processResidenceScores(
              residence, 
              sheets.rankingCategories, 
              sheets.residenceScores
            );
            const residenceData = this.createResidenceData(residence, {
              residenceTypeDoc,
              brandDoc,
              residenceFeatureIds,
              cityDoc,
              countryDoc,
              amenityIds,
              highlightedAmenities,
              lifeStyleDoc,
              placeDetails
            });
            const foundResidence = await this.residenceRepository.find({
              name: new RegExp(`^${residenceData.name}$`, 'i') 
            })
            
            if(!foundResidence) {
              await this.residenceRepository.create(residenceData);
            }else{
              const plainResidence = foundResidence.toJSON();
              delete plainResidence._id;

              await this.residenceRepository.update(
                foundResidence._id.toString(),
                {...plainResidence,...residenceData}
              );
            }
            
            
            if (rankingScoreDocArray?.length) {
              await this.rankingRequestRepository.createMany(rankingScoreDocArray);
            }
      
          } catch (error) {
            errors.residences.push({
              id: (singleResidence as Residence).residence_id,
              name: (singleResidence as Residence).name,
              error: error.message
            });
          }
        }
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

  private createResidenceData(residence: Residence, data: {
    residenceTypeDoc: any;
    brandDoc: any;
    residenceFeatureIds: any[];
    cityDoc: any;
    countryDoc: any;
    amenityIds: any[];
    highlightedAmenities: any[];
    lifeStyleDoc: any;
    placeDetails: any;
}) {
    const baseData: any = {
        name: residence.name,
        isDeleted: false,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        eVerification: true,
        verifiedOn: new Date()
    };

    // Handle required IDs and basic fields
    if (data.residenceTypeDoc?._id) {
        baseData.residenceTypeIds = [new Types.ObjectId(data.residenceTypeDoc._id)];
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
    if (residence.subtitle?.toString().trim() || residence.general_description?.toString().trim() || 
        residence.community?.toString().trim() || residence.recent_renovation?.toString().trim() || 
        residence.local_attractions?.toString().trim() || residence.future_development?.toString().trim()) {
        
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
    if (data?.residenceFeatureIds?.length > 0 || residence.build_year?.toString().trim() || 
        residence.rental_potential?.toString().trim() || residence.development_status?.toString().trim() || 
        residence.pet_policy?.toString().trim() || residence.floor_area_sqft?.toString().trim()) {
        
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
                residenceKeyFeatures.floorAreaSqFt = floorArea;
            }
        }

        if (Object.keys(residenceKeyFeatures).length > 0) {
            baseData.residenceKeyFeatures = residenceKeyFeatures;
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
    if (data.countryDoc?.name?.toString().trim() || residence.state?.toString().trim() || 
        data.cityDoc?.name?.toString().trim() || residence.address?.toString().trim() || 
        data.placeDetails?.latitude || data.placeDetails?.longitude) {
        
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


    if (!brandDoc) {
      const brandData: any = {
        name: matchingBrand.name,
        description: matchingBrand.description || '',
        registeredDate: new Date(),
        status: 'active',
        brandCategoryId: await this.processBrandCategory(matchingBrand, brandCategories),
      };

     
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
    if( matchingBrandCategory.name == "Luxury Hotel and Resort Brands"){
      matchingBrandCategory.name = 'Luxury Hotel Resort Brands'
    }
    let brandCategoryDoc = await this.brandCategoryRepository.find({
      name: { $regex: new RegExp(matchingBrandCategory.name, 'i') }
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
      };


      lifeStyleDoc = await this.lifeStyleRepository.create(lifestyleData);
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
    const BATCH_SIZE = 10;

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheets = {
        residences: XLSX.utils.sheet_to_json(workbook.Sheets['Residences']),
      };

      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);
        
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
              secondGalleryPath ? this.listS3Objects(secondGalleryPath) : []
            ]);
  
            const mainGalleryUploads = await this.createUploadRecords(mainGalleryObjects);
            const secondGalleryUploads = await this.createUploadRecords(secondGalleryObjects);
            
            if (mainGalleryUploads.length > 0 || secondGalleryUploads.length > 0) {
              const visualsUpdate: any = {
                  visuals: {}
              };

              if (mainGalleryUploads.length > 0) {
                  visualsUpdate.visuals.mainPhotos = [mainGalleryUploads[0]?._id]; 
                  visualsUpdate.visuals.mainGalleryPhotos = mainGalleryUploads.map(upload => upload._id);
              }
      
              if (secondGalleryUploads.length > 0) {
                  visualsUpdate.visuals.secondGalleryPhotos = secondGalleryUploads.map(upload => upload._id);
              }
      
              await this.residenceRepository.updateWithFilter(
                  { name: residence.name,  isDeleted: false },
                  { $set: visualsUpdate }
              );

            }
        }
      }
  }

  private async listS3Objects(prefix: string) {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: prefix + '/', 
            MaxKeys: 1000
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
                driver: 'S3'
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
        'webp': 'image/webp'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

/// city
async processCityImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    cities: XLSX.utils.sheet_to_json(workbook.Sheets['Cities']),
  };

  for (let i = 0; i < sheets.cities.length; i += BATCH_SIZE) {
    const batch = sheets.cities.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleCity of batch) {
      const city = singleCity as CityInterface;
      
      if (city.logo) {
        const imagePath = `${process.env.CITY_SEEDER_FOLDER}/${city.logo}`;
        
        try {
          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.cityModel.updateOne(
                { name: city.name, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'main'
                    }]
                  } 
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing image for city ${city.name}:`, error);
        }
      }
    }
  }
}

private async listS3Object(prefix: string) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1
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
      driver: 'S3'
    };

    return await this.uploadRepository.create(uploadRecord);
  } catch (error) {
    console.error(`Error creating upload record for ${s3Object.Key}:`, error);
    return null;
  }
}

// countries 
async processCountryImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    countries: XLSX.utils.sheet_to_json(workbook.Sheets['Countries']),
  };

  for (let i = 0; i < sheets.countries.length; i += BATCH_SIZE) {
    const batch = sheets.countries.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleCountry of batch) {
      const country = singleCountry as CountryInterface;
      
      if (country.logo) {
        try {
          const imagePath = `${process.env.COUNTRY_SEEDER_FOLDER}/${country.logo}`;

          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.countryModel.updateOne(
                { name: country.name, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'main'
                    }]
                  } 
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing image for country ${country.name}:`, error);
        }
      }
    }
  }
}


//PropertyType
async processPropertyTypeImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    propertyTypes: XLSX.utils.sheet_to_json(workbook.Sheets['PropertyTypes']),
  };

  for (let i = 0; i < sheets.propertyTypes.length; i += BATCH_SIZE) {
    const batch = sheets.propertyTypes.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singlePropertyType of batch) {
      const propertyType = singlePropertyType as PropertyTypeInterface;
      
      if (propertyType.image_path) {
        const imagePath = `${process.env.PROPERTY_TYPE_SEEDER_FOLDER}/${propertyType.image_path}`;
        
        try {
          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.propertyTypeRepository.updateWithFilter(
                { name: propertyType.name, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'main'
                    }]
                  } 
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing image for property type ${propertyType.name}:`, error);
        }
      }
    }
  }
}

///Lifestyle 
async processLifestyleImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    lifestyles: XLSX.utils.sheet_to_json(workbook.Sheets['Lifestyles']),
  };

  for (let i = 0; i < sheets.lifestyles.length; i += BATCH_SIZE) {
    const batch = sheets.lifestyles.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleLifestyle of batch) {
      const lifestyle = singleLifestyle as LifeStyleInterface;
      
      if (lifestyle.image_path) {
        const imagePath = `${process.env.LIFESTYLE_SEEDER_FOLDER}/${lifestyle.image_path}`;
        
        try {
          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.lifeStyleRepository.updateWithFilter(
                { name: lifestyle.name, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'main'
                    }]
                  } 
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing image for lifestyle ${lifestyle.name}:`, error);
        }
      }
    }
  }
}



async processRankingCategoryImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    rankingCategories: XLSX.utils.sheet_to_json(workbook.Sheets['RankingCategories']),
  };

  for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
    const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleRankingCategory of batch) {
      const rankingCategory = singleRankingCategory as any;
      
      if (rankingCategory.image_folder_name && rankingCategory.image_name) {
        const imagePath = `${rankingCategory.image_folder_name}/${rankingCategory.image_name}`;
        
        try {
          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.rankingCategoryRepository.updateWithFilter(
                { title: rankingCategory.title, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'Picture'
                    }]
                  } 
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
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    geographicalAreas: XLSX.utils.sheet_to_json(workbook.Sheets['GeographicalArea']),
  };

  for (let i = 0; i < sheets.geographicalAreas.length; i += BATCH_SIZE) {
    const batch = sheets.geographicalAreas.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleArea of batch) {
      const geographicalArea = singleArea as GeographicalAreasInterface;
      
      if (geographicalArea.image_path) {
        const imagePath = `${process.env.GEOGRAPHICAL_AREAS_SEEDER_FOLDER}/${geographicalArea.image_path}`;
        
        try {
          const s3Object = await this.listS3Object(imagePath);
          
          if (s3Object.length > 0) {
            const uploadRecord = await this.createUploadRecord(s3Object[0]);
            
            if (uploadRecord) {
              await this.geographicalAreasRepository.updateWithFilter(
                { name: geographicalArea.name, isDeleted: false },
                { 
                  $set: { 
                    upload: [{
                      ImageId: uploadRecord._id,
                      type: 'main'
                    }]
                  } 
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing image for geographical area ${geographicalArea.name}:`, error);
        }
      }
    }
  }
}

// brand
async processBrandImages(file: Express.Multer.File) {
  const BATCH_SIZE = 10;
  
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheets = {
    brands: XLSX.utils.sheet_to_json(workbook.Sheets['Brands']),
  };

  for (let i = 0; i < sheets.brands.length; i += BATCH_SIZE) {
    const batch = sheets.brands.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    for (const singleBrand of batch) {
      const brand = singleBrand as any;
      const uploadArray = [];
      
      try {
        // Process logo image
        if (brand.image1_path) {
          const logoPath = `${process.env.BRAND_SEEDER_LOGO_FOLDER}/${brand.image1_path}`;
          const logoUpload = await this.processImage(logoPath, 'logo');
          if (logoUpload) uploadArray.push(logoUpload);
        }

        // Process logo directory image
        if (brand.image2_path) {
          const logoDirectoryPath = `${process.env.BRAND_SEEDER_DIRECTORY_FOLDER}/${brand.image2_path}`;
          const logoDirectoryUpload = await this.processImage(logoDirectoryPath, 'logoDirectory');
          if (logoDirectoryUpload) uploadArray.push(logoDirectoryUpload);
        }

        // Process preview image
        if (brand.image3_path) {
          const previewPath = `${process.env.BRAND_SEEDER_PREVIEW_FOLDER}/${brand.image3_path}`;
          const previewUpload = await this.processImage(previewPath, 'preview');
          if (previewUpload) uploadArray.push(previewUpload);
        }

        // Process background image
        if (brand.image4_path) {
          const backgroundPath = `${process.env.BRAND_SEEDER_BG_FOLDER}/${brand.image4_path}`;
          const backgroundUpload = await this.processImage(backgroundPath, 'backgroundImage');
          if (backgroundUpload) uploadArray.push(backgroundUpload);
        }

        // Update brand document if any images were processed
        if (uploadArray.length > 0) {
          await this.brandRepository.updateWithFilter(
            { name: brand.name, isDeleted: false },
            { 
              $set: { 
                upload: uploadArray
              } 
            }
          );
        }
      } catch (error) {
        console.error(`Error processing images for brand ${brand.name}:`, error);
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
          type: imageType
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error processing ${imageType} image at path ${imagePath}:`, error);
    return null;
  }
}

// private async apiRequest(endpoint: string) {
//   try {
//     const response = await axios.get(`${this.BASE_URL}${endpoint}`, {
//       headers: { 'X-CSCAPI-KEY': this.API_KEY },
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`API request failed for ${endpoint}:`, error.message);
//     return [];
//   }
// }

// async seedLocations() {
  
//   const countries = await this.apiRequest('/countries');

//   for (const country of countries) {
//     await new Promise(resolve => setTimeout(resolve, 100));

//     const existingCountry = await this.countryModel.findOne({ 
//       name: country.name 
//     });

//     const countryData = {
//       name: country.name,
//       countryCode: country.iso2,
//       phoneCode: country.phonecode,
//       capital: country.capital,
//       currency: country.currency,
//       native: country.native,
//     };

//     const dbCountry = existingCountry 
//       ? await this.countryModel.findByIdAndUpdate(
//           existingCountry._id,
//           { ...countryData },
//           { new: true }
//         )
//       : await this.countryModel.create(countryData);

//     const states = await this.apiRequest(`/countries/${country.iso2}/states`);

//     for (const state of states) {
//       const existingState = await this.stateRepository.find({
//         name: state.name,
//         countryId: dbCountry._id
//       });

//       const stateData = {
//         name: state.name,
//         countryId: dbCountry._id,
//         countryCode: state.country_code,
//         stateCode: state.iso2,
//         latitude: state.latitude,
//         longitude: state.longitude,
//       };

//       const dbState = existingState
//         ? await this.stateRepository.update(
//             existingState._id.toString(),
//             { ...stateData, active: true }
//           )
//         : await this.stateRepository.create(stateData);

//       const cities = await this.apiRequest(
//         `/countries/${country.iso2}/states/${state.iso2}/cities`
//       );

//       for (const city of cities) {
//         const existingCity = await this.cityModel.findOne({
//           name: city.name,
//           stateId: dbState._id,
//         });

//         const cityData = {
//           name: city.name,
//           countryId: dbCountry._id,
//           stateId: dbState._id,
//           latitude: city.latitude,
//           longitude: city.longitude,
//         };

//         if (existingCity) {
//           await this.cityModel.findByIdAndUpdate(
//             existingCity._id,
//             { ...cityData }
//           );
//         } else {
//           await this.cityModel.create(cityData);
//         }
//       }
//     }
//   }
// }

async seedLocations() {
  try {
    const DELAY_MS = 500; // Increased delay for API rate limiting
    const countries = await this.apiRequest('/countries');
    
    for (const country of countries) {
      try {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        
        // Upsert country
        const countryData = {
          name: country.name,
          countryCode: country.iso2,
          phoneCode: country.phonecode,
          capital: country.capital,
          currency: country.currency,
          native: country.native,
        };

        const dbCountry = await this.countryModel.findOneAndUpdate(
          { name: country.name },
          { $set: countryData },
          { upsert: true, new: true }
        );

        // Fetch and process states
        const states = await this.apiRequest(`/countries/${country.iso2}/states`);
        const stateBulkOps = states.map(state => ({
          updateOne: {
            filter: { 
              name: state.name,
              countryId: dbCountry._id 
            },
            update: {
              $set: {
                name: state.name,
                countryId: dbCountry._id,
                countryCode: state.country_code,
                stateCode: state.iso2,
                latitude: state.latitude,
                longitude: state.longitude,
                active: true
              }
            },
            upsert: true
          }
        }));

        if (stateBulkOps.length > 0) {
          await this.stateModel.bulkWrite(stateBulkOps);
        }

        // Process cities in batches
        for (const state of states) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          
          const cities = await this.apiRequest(
            `/countries/${country.iso2}/states/${state.iso2}/cities`
          );

          const cityBulkOps = cities.map(city => ({
            updateOne: {
              filter: {
                name: city.name,
                countryId: dbCountry._id,
                stateId: state._id
              },
              update: {
                $set: {
                  name: city.name,
                  countryId: dbCountry._id,
                  stateId: state._id,
                  latitude: city.latitude,
                  longitude: city.longitude
                }
              },
              upsert: true
            }
          }));

          if (cityBulkOps.length > 0) {
            await this.cityModel.bulkWrite(cityBulkOps);
          }
        }
        
      } catch (error) {
        console.error(`Error processing country ${country.name}:`, error);
        continue; 
      }
    }
  } catch (error) {
    throw new Error(`Failed to seed locations: ${error.message}`);
  }
}

private async apiRequest(endpoint: string) {
  try {
    const response = await axios.get(`${this.BASE_URL}${endpoint}`, {
      headers: { 'X-CSCAPI-KEY': this.API_KEY }
    });
    return response.data;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

}
