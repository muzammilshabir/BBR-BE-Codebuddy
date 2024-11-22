import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Residence } from 'src/residences/schema/residences.schema';
import { City } from 'src/city/schema/city.schema';
import { Country } from 'src/country/schema/country.schema';
import { ResidenceDraft } from 'src/residencesDraft/schema/residencesDraft.schema';
import {
  InvoicePostPaymentAction,
  InvoicePostPaymentActionType,
  ResidenceDetails,
  UserDetails,
} from 'src/stripe/schema/invoice-post-payment-action.schema';
import { UserRole } from 'src/users/enum/user.enum';
import { SignupMethod } from 'src/users/enum/user.enum';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class InvoicePostPaymentActionService {
  constructor(
    @InjectModel(InvoicePostPaymentAction.name)
    private invoicePostPaymentActionModel: Model<InvoicePostPaymentAction>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ResidenceDraft.name)
    private residenceDraftModel: Model<ResidenceDraft>,
    @InjectModel(City.name)
    private cityModel: Model<City>,
    @InjectModel(Country.name)
    private countryModel: Model<Country>,
    @InjectModel(Residence.name)
    private residenceModel: Model<Residence>
  ) {}

  async create(
    invoiceId: string,
    type: InvoicePostPaymentActionType,
    data: UserDetails | ResidenceDetails
  ) {
    return this.invoicePostPaymentActionModel.create({
      invoiceId,
      type,
      data,
    });
  }

  async performActions(invoiceId: string) {
    const invoicePostPaymentActions = await this.invoicePostPaymentActionModel.find({
      invoiceId,
    });

    let user: User;
    for (const action of invoicePostPaymentActions) {
      if (action.type === InvoicePostPaymentActionType.CREATE_USER) {
        const userDetails = action.data as UserDetails;
        user = await this.userModel.create({
          fullName: userDetails.fullName,
          email: userDetails.email,
          password: userDetails.password,
          isVerified: false,
          signupMethod: SignupMethod.EMAIL,
          role: UserRole.SELLER,
          stripeCustomerId: userDetails.stripeCustomerId,
        });
      }

      if (action.type === InvoicePostPaymentActionType.CREATE_RESIDENCE) {
        const residenceDetails = action.data as ResidenceDetails;

        const city = await this.cityModel.findById(residenceDetails.cityId);
        const country = await this.countryModel.findById(residenceDetails.countryId);

        const residenceData = {
          name: residenceDetails.name,
          cityId: residenceDetails.cityId,
          countryId: residenceDetails.countryId,
          createdById: user._id,
          developerId: user._id,
          address: {
            city: city.name,
            country: country.name,
            userInput: residenceDetails.address1,
            location: residenceDetails.location,
            placeId: residenceDetails.placeId,
          },
        };
        const residence = await this.residenceModel.create(residenceData);
        await this.residenceDraftModel.create({
          ...residenceData,
          residenceId: residence._id,
        });
      }
    }
  }
}
