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

interface RankingCategory {
  ranking_category_id:string,
  image_path: string;
  title: string;
  description: string;
  category_type: string;
  residence_limitation: string;
  ranking_price: number;
  country_id?: string;
  city_id?: string;
  lifestyle_id?: string;
  brand_id?: string;
  property_id?: string;
}

interface Residence {
  residence_id:string;
  name: string;
  residencetype_id: string;
  address: string;
  website_link: string;
  brand_id: string;
  subtitle: string;
  brief_description: string;
  general_description: string;
  community: string;
  recent_renovation: string;
  local_attractions: string;
  future_development: string;
  start_range: number;
  end_range: number;
  build_year: number;
  rental_potential: string;
  development_status: string;
  floor_area_sqft: number;
  pet_policy:string;
  staff_to_residence_ratio: number;
  highlighted_amenity_id1: string;
  highlighted_amenity_description1: string;
  highlighted_amenity_image_path1: string;
  highlighted_amenity_id2: string;
  highlighted_amenity_description2: string;
  highlighted_amenity_image_path2: string;
  highlighted_amenity_id3: string;
  highlighted_amenity_description3: string;
  highlighted_amenity_image_path3: string;
  country_id: string;
  state: string;
  city_id: string;
  lifestyle_id: string;
  main_photo: string;
}

// const fieldMapping = {
//   country_id: 'countryId',
//   city_id: 'cityId',
//   lifestyle_id: 'lifeStyleId',
//   brand_id: 'brandId',
//   property_id: 'propertyTypeId',
// };

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
      residences: []
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
        propertyTypes : XLSX.utils.sheet_to_json(workbook.Sheets['PropertyTypes'])
      };
  
      for (let i = 0; i < sheets.rankingCategories.length; i += BATCH_SIZE) {
        const batch = sheets.rankingCategories.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (rankingCategory) => {
          try {
            const rankingCategoryTyped = rankingCategory as RankingCategory;
            const criteria = await this.processCriteria(rankingCategoryTyped, sheets.rankingCriterias);
            
            const idFields = ['country_id', 'city_id', 'lifestyle_id', 'brand_id', 'property_id'];
            const foundIdField = idFields.find(field => rankingCategoryTyped[field] != null);
            
            if (!foundIdField) {
              throw new Error(`No valid ID field found for rankingCategory: ${rankingCategoryTyped.title}`);
            }
  
            const categoryType = foundIdField.replace('_id', '');
            const doc = await this.processCategoryType(categoryType, rankingCategoryTyped, {
              countries: sheets.countries,
              cities: sheets.cities,
              lifestyles: sheets.lifestyles,
              brands: sheets.brands,
              propertyTypes: sheets.propertyTypes
            });
  
            const rankingCategoryData = {
              title: rankingCategoryTyped.title,
              description: rankingCategoryTyped.description,
              categoryType: rankingCategoryTyped.category_type,
              residenceLimitation: rankingCategoryTyped.residence_limitation,
              price: rankingCategoryTyped.ranking_price,
              criteria,
              status: 'active',
              [this.getSchemaField(foundIdField)]: doc._id
            };
  
            await this.rankingCategoryRepository.create(rankingCategoryData);
          } catch (error) {
            errors.rankingCategories.push({
              id: (rankingCategory as RankingCategory).ranking_category_id,
              name: (rankingCategory as RankingCategory).title,
              error: error.message
            });
          }
        }));
      }
  
      for (let i = 0; i < sheets.residences.length; i += BATCH_SIZE) {
        const batch = sheets.residences.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (singleResidence) => {
          try {
            const residence = singleResidence as Residence;
            
            const [
              residenceTypeDoc,
              brandDoc,
              residenceFeatureIds,
              cityDoc,
              countryDoc,
              amenityIds,
              highlightedAmenities,
              lifeStyleDoc,
              visuals,
              placeDetails,
              rankingScoreDocArray
            ] = await Promise.all([
              this.processResidence(residence, sheets.residenceTypes),
              this.processBrand(residence, sheets.brands),
              this.processResidenceFeature(residence, sheets.residenceFeatures),
              this.processCity(residence, sheets.cities, sheets.countries),
              this.processCountry(residence, sheets.countries),
              this.processAmenity(residence, sheets.amenities),
              this.findAmenities(residence, sheets.amenities),
              this.processLifestyle(residence, sheets.lifestyles),
              this.processVisuals(residence),
              this.getPlaceDetails(residence.address),
              this.processResidenceScores(residence, sheets.rankingCategories, sheets.residenceScores)
            ]);
      
            const residenceData = this.createResidenceData(residence, {
              residenceTypeDoc,
              brandDoc,
              residenceFeatureIds,
              cityDoc,
              countryDoc,
              amenityIds,
              highlightedAmenities,
              lifeStyleDoc,
              visuals,
              placeDetails
            });
      
            await Promise.all([
              this.residenceRepository.create(residenceData),
              this.rankingRequestRepository.createMany(rankingScoreDocArray)
            ]);
      
          } catch (error) {
            errors.residences.push({
              id: (singleResidence as Residence).residence_id,
              name: (singleResidence as Residence).name,
              error: error.message
            });
          }
        }));
      }
  
      return {
        success: true,
        errors
      };
  
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errors
      };
    }
  }

  private getSchemaField(idField: string): string {
    const fieldMapping: Record<string, string> = {
      'country_id': 'countryId',
      'city_id': 'cityId',
      'lifestyle_id': 'lifestyleId',
      'brand_id': 'brandId',
      'property_id': 'propertyId'
    };
    return fieldMapping[idField];
  }

  private createResidenceData(residence: Residence, data: {
    residenceTypeDoc: any,
    brandDoc: any,
    residenceFeatureIds: any[],
    cityDoc: any,
    countryDoc: any,
    amenityIds: any[],
    highlightedAmenities: any[],
    lifeStyleDoc: any,
    visuals: any,
    placeDetails: any
  }) {
    return {
      name: residence.name,
      residenceTypeIds: [new Types.ObjectId(data.residenceTypeDoc._id)],
      websiteLink: residence.website_link,
      associatedBrandId: data.brandDoc ? new Types.ObjectId(data.brandDoc._id) : undefined,
      briefOverview: {
        subtitle: residence.subtitle,
        briefDescription: residence.brief_description
      },
      comprehensiveOverview: {
        subtitle: residence.subtitle,
        generalDescription: residence.general_description,
        community: residence.community,
        recentRenovation: residence.recent_renovation,
        localAttractions: residence.local_attractions,
        futureDevelopmentPlans: residence.future_development
      },
      budgetLimitationsRange: {
        startRange: residence.start_range,
        endRange: residence.end_range
      },
      residenceKeyFeatures: {
        featureIds: data.residenceFeatureIds,
        developmentInfo: {
          yearOfBuild: residence.build_year,
          rentalPotential: residence.rental_potential,
          developmentStatus: residence.development_status,
          floorAreaSqFt: residence.floor_area_sqft,
          staffToResidenceRatio: residence.staff_to_residence_ratio
        },
        petPolicy: residence.pet_policy
      },
      visuals: data.visuals,
      nearbyAmenities: {
        amenitiesList: data.amenityIds,
        highlightedAmenities: data.highlightedAmenities
      },
      status: "active",
      cityId: new Types.ObjectId(data.cityDoc._id),
      countryId: new Types.ObjectId(data.countryDoc._id),
      lifeStyleId: new Types.ObjectId(data.lifeStyleDoc._id),
      address: {
        country: data.countryDoc.name,
        state: residence.state,
        city: data.cityDoc.name,
        userInput: residence.address,
        location: {
          lat: data.placeDetails?.latitude,
          lng: data.placeDetails?.longitude
        },
        placeId: data.placeDetails?.placeId
      },
      isDeleted: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async processResidenceScores(residence: Residence, rankingCategories: any[], residenceScores: any[]) {
    try {
      // Find matching residence scores
      const matchingScores = residenceScores.filter(score => 
        score.residence_id == residence.residence_id
      );
  
      const processedScores = [];
  
      for (const score of matchingScores) {
        // Get ranking category details
        const rankingCategory = rankingCategories.find(rc => 
          rc.ranking_category_id === score.ranking_category_id
        );
  
        if (!rankingCategory) continue;
  
        const criteriaScores = [];
        for (let i = 1; i <= 6; i++) {
          // criterid logic need to find as we do not have criteria id created
          const criteriaFeedback = score[`criteria${i}_feedback`];
          const criteriaScore = score[`criteria${i}_score`];
          
          if (criteriaFeedback && criteriaScore) {
            criteriaScores.push({
              // criteriaId: new TyObjectId(criteriaId),
              score: criteriaScore,
              description: criteriaFeedback
            });
          }
        }
  
        // Create residence score document
        const residenceScoreDoc = {
          rankingCategoryId: new Types.ObjectId(rankingCategory._id),
          residenceId: new Types.ObjectId(residence.residence_id),
          paymentStatus: "paid",
          upload: [],
          status: "active", 
          isDeleted: false,
          criteriaScores,
          bbrScore: score.bbr_score ,
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
        return this.processCountry(rankingCategory, dataSources.countries);
      case 'city':
        return this.processCity(rankingCategory, dataSources.cities, dataSources.countries);
      case 'lifestyle':
        return this.processLifestyle(rankingCategory, dataSources.lifestyles);
      case 'brand':
        return this.processBrand(rankingCategory, dataSources.brands);
      case 'property':
        return this.processProperty(rankingCategory, dataSources.propertyTypes);
      default:
        throw new Error(`Unsupported category type: ${categoryType}`);
    }
  }

  private async processProperty(model: any, properties: any[]){
    
    const matchingPropertyType = properties.find(
      (property) => property.property_id === model.property_id
    );
    matchingPropertyType.image_path = matchingPropertyType.image_path.replace(/^"|"$/g, '').trim()
    
    let propertyTypeDoc;

    propertyTypeDoc = await this.propertyTypeRepository.find({
      name: { $regex: new RegExp(`^${matchingPropertyType.name}$`, 'i') },
    });

    if (!propertyTypeDoc) {
      const imagesArray = matchingPropertyType.image_path.includes(',')
        ? matchingPropertyType.image_path.split(',').map((path) => path.trim())
        : [matchingPropertyType.image_path.trim()];

      const imageIds = await this.uploadImagesAndGetIds(imagesArray);

      propertyTypeDoc = await this.propertyTypeRepository.create({
        name: matchingPropertyType.name,
        upload: imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        })),
      });
    }

    return propertyTypeDoc;
  }

  private async processCriteria(
    rankingCategory: any, 
    rankingCriterias: any[]
  ) {
    const criteria = [];
  
    for (let i = 1; i < 7; i++) {
      const criteriaId = rankingCategory[`criteria_id${i}`];
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
              description: matchingCriteria[`scoreguide0_description`],
            },
            {
              score: Number(matchingCriteria[`scoreguide20`]),
              description: matchingCriteria[`scoreguide20_description`],
            },
            {
              score: Number(matchingCriteria[`scoreguide40`]),
              description: matchingCriteria[`scoreguide40_description`],
            },
            {
              score: Number(matchingCriteria[`scoreguide60`]),
              description: matchingCriteria[`scoreguide60_description`],
            },
            {
              score: Number(matchingCriteria[`scoreguide80`]),
              description: matchingCriteria[`scoreguide80_description`],
            },
            {
              score: Number(matchingCriteria[`scoreguide100`]),
              description: matchingCriteria[`scoreguide100_description`],
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
    matchingResidenceType.images_path = matchingResidenceType.images_path.replace(/^"|"$/g, '').trim()
    let residenceTypeDoc;

    residenceTypeDoc = await this.residenceTypeModel.findOne({
      type: { $regex: new RegExp(`^${matchingResidenceType.type}$`, 'i') },
    });

    if (!residenceTypeDoc) {
      const imagesArray = matchingResidenceType.images_path.includes(',')
        ? matchingResidenceType.images_path.split(',').map((path) => path.trim())
        : [matchingResidenceType.images_path.trim()];

      const imageIds = await this.uploadImagesAndGetIds(imagesArray);

      residenceTypeDoc = await this.residenceTypeRepository.create({
        type: matchingResidenceType.type,
        upload: imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        })),
      });
    }

    return residenceTypeDoc;
  }

  private async processBrand(model: any, brands: any[]): Promise<any> {
    const matchingBrand = brands.find(
      (brand) => brand.brand_id === model.brand_id
    );
  
    if (!matchingBrand) {
      this.logger.error(`Brand not found for residence: ${model.brand_id}`);
      return null;
    }
  
    const imageFields = [
      { path: matchingBrand.image1_path, type: 'logo' },
      { path: matchingBrand.image2_path, type: 'logoDirectory' },
      { path: matchingBrand.image3_path, type: 'preview' },
      { path: matchingBrand.image4_path, type: 'backgroundImage' },
    ];

    matchingBrand.image1_path = matchingBrand.image1_path.replace(/^"|"$/g, '').trim();
    matchingBrand.image2_path = matchingBrand.image2_path.replace(/^"|"$/g, '').trim();
    matchingBrand.image3_path = matchingBrand.image3_path.replace(/^"|"$/g, '').trim();
    matchingBrand.image4_path = matchingBrand.image4_path.replace(/^"|"$/g, '').trim();
  
    const imagesArray = imageFields
    .filter(field => field.path)
    .map(field => {
      return {
        path: field.path.replace(/^"|"$/g, '').trim(),
        type: field.type,
      };
    });

    const uploadImages = imagesArray.map(image => ({
      path: image.path,
      type: image.type,
    }));

    let brandDoc;
  
    brandDoc = await this.brandRepository.find({
      name: { $regex: new RegExp(`^${matchingBrand.name}$`, 'i') },
    });
  
    if (!brandDoc) {

      const imageIds = await this.uploadImagesAndGetIds(uploadImages.map(image => image.path));
  
      brandDoc = await this.brandRepository.create({
        name: matchingBrand.name,
        description: matchingBrand.description || '',
        upload: imageIds.map((id, index) => ({
          ImageId: new Types.ObjectId(id),
          type: uploadImages[index].type, 
        })),
        registeredDate: new Date(),
        status:'active',
      });
    }
  
    return brandDoc;
  }

  private async processResidenceFeature(residence: any , residenceFeatures: any[]){

    const  featureIds = [];
    const residenceFeatureIds =  residence.feature_ids.replace(/^"|"$/g, '').trim().split(',').map((id) => id.trim());

    for(const residenceFeatureId of  residenceFeatureIds ){
      const matchingResidenceFeature = residenceFeatures.find(
        (residenceFeature) => residenceFeature.feature_id == residenceFeatureId
      );
      matchingResidenceFeature.image_path = matchingResidenceFeature.image_path.replace(/^"|"$/g, '').trim()
     
      let residenceFeatureDoc

      residenceFeatureDoc = await this.residenceFeatureRepository.find({
        name: { $regex: new RegExp(`^${matchingResidenceFeature.name}$`, 'i') },
      })
  
      if (!residenceFeatureDoc) {
        const imagesArray = matchingResidenceFeature.image_path.includes(',')
          ? matchingResidenceFeature.image_path.split(',').map((path) => path.trim())
          : [matchingResidenceFeature.image_path.trim()];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);
        
        residenceFeatureDoc = await this.residenceFeatureRepository.create({
          name: matchingResidenceFeature.name,
          upload: imageIds.map((id) => ({
            ImageId: new Types.ObjectId(id),
          })),
        });
      }
  
      featureIds.push(new Types.ObjectId(residenceFeatureDoc._id))
    }
    return featureIds
  }

  private async processCity(model: any, cities: any[], countries: any[]) {

    const matchingCity = cities.find(
      (city) => city.city_id == model.city_id
    );
  
    if (!matchingCity) {
      throw new Error(`City with city_id ${model.city_id} not found`);
    }
  
    matchingCity.logo = matchingCity.logo.replace(/^"|"$/g, '').trim();
  
    let cityDoc;
  
    const countryId = await this.processCountry(matchingCity, countries);

    cityDoc = await this.cityModel.findOne({
      name: { $regex: new RegExp(`^${matchingCity.name}$`, 'i') },
      countryId: new Types.ObjectId(countryId),
    });
  
    if (!cityDoc) {

      const imagesArray = matchingCity.logo.includes(',')
        ? matchingCity.logo.split(',').map((path) => path.trim())
        : [matchingCity.logo.trim()];
  
      const imageIds = await this.uploadImagesAndGetIds(imagesArray);
  
      cityDoc = await this.cityModel.create({
        name: matchingCity.name,
        countryId: new Types.ObjectId(countryId),
        upload: imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        })),
      });
    }
  
    return cityDoc; 
  }

  private async processCountry(model: any, countries: any[]) {

    const matchingCountry = countries.find(
      (country) => country.country_id === model.country_id
    );
  
    if (!matchingCountry) {
      throw new Error(`Country with country_id ${model.country_id} not found`);
    }
  
    matchingCountry.logo = matchingCountry.logo.replace(/^"|"$/g, '').trim();
  
    let countryDoc;
  
    countryDoc = await this.countryModel.findOne({
      name: { $regex: new RegExp(`^${matchingCountry.name}$`, 'i') }
    });
  
    if (!countryDoc) {

      const imagesArray = matchingCountry.logo.includes(',')
        ? matchingCountry.logo.split(',').map((path) => path.trim())
        : [matchingCountry.logo.trim()];
  
      const imageIds = await this.uploadImagesAndGetIds(imagesArray);
  
      countryDoc = await this.countryModel.create({
        name: matchingCountry.name,
        upload: imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'logo', 
        })),
      });
    }
  
    return countryDoc;
  }

  private async processAmenity(residence: any, amenities: any[]){
    const  ids = [];

    const amenityIds =  residence.amenity_ids.replace(/^"|"$/g, '').trim().split(',').map((id) => id.trim());

    for(const amenityId of  amenityIds ){

      const matchingAmenity = amenities.find(
        (amenity) => amenity.amenity_id == amenityId
      );
      
      let amenityDoc
      
      amenityDoc = await this.amenityRepository.find({
        name: { $regex: new RegExp(`^${matchingAmenity.name}$`, 'i') },
      })
     
      matchingAmenity.logo_image = matchingAmenity.logo_image.replace(/^"|"$/g, '').trim()
  
      if (!amenityDoc) {
        const imagesArray = matchingAmenity.logo_image.includes(',')
          ? matchingAmenity.logo_image.split(',').map((path) => path.trim())
          : [matchingAmenity.logo_image.trim()];

        const imageIds = await this.uploadImagesAndGetIds(imagesArray);
        
        amenityDoc = await this.amenityRepository.create({
          name: matchingAmenity.name,
          upload: imageIds.map((id) => ({
            ImageId: new Types.ObjectId(id),
            type:"logo"
          })),
        });
      }
  
      ids.push(new Types.ObjectId(amenityDoc._id))
    }
    return ids



  }

  private async findAmenities(residence: any, amenities: any[]) {
    const highlightedAmenities = [];
  
    for (let i = 1; i < 4; i++) {
      const matchingAmenity = amenities.find(
        (amenity) => amenity.amenity_id == residence[`highlighted_amenity_id${i}`]
      );
  
      if (!matchingAmenity) {
        throw new Error(`Matching amenity not found for highlighted_amenity_id${i}`);
      }
  
      const amenityDoc = await this.amenityRepository.find({
        name: { $regex: new RegExp(`^${matchingAmenity.name}$`, 'i') },
      });
  
      if (!amenityDoc) {
        throw new Error(`Amenity document not found for name: ${matchingAmenity.name}`);
      }
  
      const amenityId = new Types.ObjectId(amenityDoc._id as Types.ObjectId); 
  
      residence[`highlighted_amenity_image_path${i}`] = residence[`highlighted_amenity_image_path${i}`]
        .replace(/^"|"$/g, '')
        .trim();
  
      const imageIds = await this.uploadImagesAndGetIds([residence[`highlighted_amenity_image_path${i}`]]);
  
      highlightedAmenities.push({
        amenityId,
        generalDescription: residence[`highlighted_amenity_description${i}`],
        imageId: imageIds[0],
      });
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
  
    matchingLifestyle.image_path = matchingLifestyle.image_path.replace(/^"|"$/g, '').trim();
  
    let lifeStyleDoc;

    lifeStyleDoc = await this.lifeStyleRepository.find({
      name: { $regex: new RegExp(`^${matchingLifestyle.name}$`, 'i') },
    });
  
    if (!lifeStyleDoc) {

      const imagesArray = matchingLifestyle.image_path.includes(',')
        ? matchingLifestyle.image_path.split(',').map((path) => path.trim())
        : [matchingLifestyle.image_path.trim()];
  
      const imageIds = await this.uploadImagesAndGetIds(imagesArray);
  
      lifeStyleDoc = await this.lifeStyleRepository.create({
        name: matchingLifestyle.name,
        upload: imageIds.map((id) => ({
          ImageId: new Types.ObjectId(id),
          type: 'main',
        })),
      });
    }
  
    return lifeStyleDoc;
  }

  private async processVisuals(residence: any) {
    const fields = ['main_gallery_images', 'second_gallery_images', 'main_photo'];
  
    const processImages = async (field: string) => {
      const value = residence[field]?.replace(/^"|"$/g, '').trim(); 
      if (!value) return []; 
  
      const imagesArray = value.includes(',')
        ? value.split(',').map((path) => path.trim())
        : [value.trim()];
  
      return await this.uploadImagesAndGetIds(imagesArray);
    };
  
    const [main_gallery_images, second_gallery_images, main_photo] = await Promise.all(
      fields.map((field) => processImages(field))
    );
  
    return {
      main_photo,
      main_gallery_images,
      second_gallery_images,
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
        console.log('No place found for the given address.');
        return {
          placeId: null,
          latitude: null,
          longitude: null,
        };
      }
    } catch (error) {
      console.error('Error fetching place details:', error.response ? error.response.data : error.message);
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
      const filePath = path.resolve(__dirname, '../../../../..', file);
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
