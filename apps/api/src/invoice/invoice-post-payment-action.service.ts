import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Residence } from 'src/residences/schema/residences.schema';
import { City } from 'src/city/schema/city.schema';
import { Country } from 'src/country/schema/country.schema';
import { ResidenceDraft } from 'src/residencesDraft/schema/residencesDraft.schema';
import {
  BbrVerificationRequestDetails,
  BespokeRequestDetails,
  FeatureRequestDetails,
  InvoicePostPaymentAction,
  InvoicePostPaymentActionType,
  RankingRequestDetails,
  ResidenceDetails,
  UserDetails,
} from 'src/stripe/schema/invoice-post-payment-action.schema';
import { UserRole } from 'src/users/enum/user.enum';
import { SignupMethod } from 'src/users/enum/user.enum';
import { User } from 'src/users/schema/user.schema';
import { RankingRequest } from 'src/rankingRequest/schema/rankingRequest.schema';
import { RankingRequestDraft } from 'src/rankingRequestDraft/schema/rankingRequestDraft.schema';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { Invoice } from 'src/stripe/schema/invoice.schema';
import { Transaction } from 'src/stripe/schema/transaction.schema';
import { TransactionStatus } from 'src/stripe/enum/transaction-status.enum';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/users/user.service';
import { FeatureRequest } from 'src/featureRequests/schema/featureRequest.schema';
import { BbrVerification } from 'src/bbr-verification/schema/bbr-verification.schema';
import { CustomerSupportService } from 'src/customer-support/customer-support.service';
import { BespokeRequest } from '../bespokeRequests/schema/bespokeRequests.schema';

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
    private residenceModel: Model<Residence>,
    @InjectModel(RankingRequest.name)
    private rankingRequestModel: Model<RankingRequest>,
    @InjectModel(RankingRequestDraft.name)
    private rankingRequestDraftModel: Model<RankingRequestDraft>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(FeatureRequest.name)
    private featureRequestModel: Model<FeatureRequest>,
    @InjectModel(BbrVerification.name)
    private bbrVerificationModel: Model<BbrVerification>,
    @InjectModel(BespokeRequest.name)
    private bespokeRequestModel: Model<BespokeRequest>,
    private authService: AuthService,
    private userService: UserService,
    private readonly customerSupportService: CustomerSupportService
  ) {}

  async create(
    invoiceId: string,
    type: InvoicePostPaymentActionType,
    data:
      | UserDetails
      | ResidenceDetails
      | RankingRequestDetails
      | FeatureRequestDetails
      | BbrVerificationRequestDetails
      | BespokeRequestDetails,
    order: number
  ) {
    return this.invoicePostPaymentActionModel.create({
      invoiceId,
      type,
      data,
      order,
    });
  }

  async performActions(invoiceId: string, amount: number) {
    const invoicePostPaymentActions = await this.invoicePostPaymentActionModel
      .find({
        invoiceId,
      })
      .sort({ order: 1 });

    let user: User;
    let residence: Residence;
    for (const action of invoicePostPaymentActions) {
      if (action.type === InvoicePostPaymentActionType.CREATE_USER) {
        const userDetails = action.data as UserDetails;
        user = await this.userModel.create({
          fullName: userDetails.fullName,
          email: userDetails.email,
          password: userDetails.password,
          phone: userDetails.phone,
          isVerified: false,
          signupMethod: SignupMethod.EMAIL,
          role: UserRole.SELLER,
          stripeCustomerId: userDetails.stripeCustomerId,
        });
        user = await this.userService.assignVerificationToken(userDetails.email);
        this.authService.sendVerificationEmail(user.email, user.verificationToken, user.role);

        await this.invoiceModel.findByIdAndUpdate(invoiceId, {
          createdById: user._id,
          developerId: user._id,
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
        residence = await this.residenceModel.create(residenceData);
        await Promise.all([
          this.residenceDraftModel.create({
            ...residenceData,
            residenceId: residence._id,
          }),
          this.invoiceModel.findByIdAndUpdate(invoiceId, {
            residenceId: residence._id,
          }),
          this.transactionModel.create({
            residenceId: residence._id,
            developerId: user._id,
            invoiceId: invoiceId,
            amount,
            status: TransactionStatus.PAID,
          }),
        ]);
      }

      if (action.type === InvoicePostPaymentActionType.CREATE_RANKING_REQUEST) {
        const rankingRequestDetails = action.data as RankingRequestDetails;
        await Promise.all(
          rankingRequestDetails.rankingCategoryIds.map(async (rankingCategoryId) => {
            const rankingData = {
              developerId: user._id,
              rankingCategoryId,
              residenceId: residence._id,
              paymentStatus: PaymentStatus.PAID,
            };
            const rankingRequest = await this.rankingRequestModel.create(rankingData);
            await this.rankingRequestDraftModel.create({
              ...rankingData,
              rankingRequestId: rankingRequest._id,
            });
          })
        );
        if (rankingRequestDetails.userInfo) {
          await this.customerSupportService.create({
            name: rankingRequestDetails.userInfo.fullName,
            email: rankingRequestDetails.userInfo.email,
            message: `Payment for ranking requests with ids:${rankingRequestDetails.rankingCategoryIds.join(', ')} and invoice id:${invoiceId} is Paid`,
          });
        }
      }

      if (action.type === InvoicePostPaymentActionType.CREATE_FEATURE_REQUEST) {
        const featureRequestDetails = action.data as FeatureRequestDetails;
        await this.featureRequestModel.findByIdAndUpdate(featureRequestDetails.featureRequestId, {
          status: PaymentStatus.PAID,
        });

        await this.customerSupportService.create({
          name: featureRequestDetails.userInfo.fullName,
          email: featureRequestDetails.userInfo.email,
          message: `Payment for feature request with id:${featureRequestDetails.featureRequestId} and invoice id:${invoiceId} is Paid`,
        });
      }

      if (action.type === InvoicePostPaymentActionType.CREATE_BESPOKE_REQUEST) {
        const featureRequestDetails = action.data as BespokeRequestDetails;
        await this.bespokeRequestModel.findByIdAndUpdate(featureRequestDetails.bespokeRequestId, {
          status: PaymentStatus.PAID,
        });

        await this.customerSupportService.create({
          name: featureRequestDetails.userInfo.fullName,
          email: featureRequestDetails.userInfo.email,
          message: `Payment for bespoke request with id:${featureRequestDetails.bespokeRequestId} and invoice id:${invoiceId} is Paid`,
        });
      }

      if (action.type === InvoicePostPaymentActionType.CREATE_BBR_VERIFICATION_REQUEST) {
        const bbrVerificationRequestDetails = action.data as BbrVerificationRequestDetails;
        await this.bbrVerificationModel.findByIdAndUpdate(
          bbrVerificationRequestDetails.bbrVerificationRequestId,
          {
            status: PaymentStatus.PAID,
          }
        );

        await this.customerSupportService.create({
          name: bbrVerificationRequestDetails.userInfo.fullName,
          email: bbrVerificationRequestDetails.userInfo.email,
          message: `Payment for bbr verification request with id:${bbrVerificationRequestDetails.bbrVerificationRequestId} and invoice id:${invoiceId} is Paid`,
        });
      }
    }
  }
}
