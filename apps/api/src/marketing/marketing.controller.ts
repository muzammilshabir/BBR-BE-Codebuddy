import { Controller, Get, Param, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { residenceIdSchema } from 'src/customer-reviews/dto/get-reviews-by-residenceId.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResidenceIdDto } from './dto/upgrade-option.dto';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';


@ApiTags('Marketing-opportunities')
@Controller('marketing')
export class MarketingController {

    constructor(private readonly marketingService: MarketingService) {}

    @Get('/:residenceId')
    @ApiOperation({
        summary: 'Fetch current features and upgrade options',
    })
    @ApiBearerAuth()
    @Roles(UserRole.SELLER)
    @UsePipes(new JoiValidationPipe(residenceIdSchema, 'param'))
    async getFeatures(@Param() residenceId: ResidenceIdDto) {
        const result = await this.marketingService.getFeatures(residenceId);
        return ResponseService.buildResponse( result );
    }

}
