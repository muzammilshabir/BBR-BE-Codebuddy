import { Controller, Post, Patch, Get, Body, Param, UsePipes, Query, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { BbrVerificationService } from './bbr-verification.service';
import {
  CreateBbrVerificationDto,
  createBbrVerificationSchema,
} from './dto/create-bbr-verification.dto';
import {
  UpdateBbrVerificationDto,
  updateBbrVerificationSchema,
} from './dto/update-bbr-verification.dto';
import { ListBbrVerificationDto, listBbrVerificationSchema } from './dto/list-bbr-verification.dto';
import { UserRole } from 'src/users/enum/user.enum';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';

@ApiTags('Bbr Verifications')
@Controller('bbr-verification')
export class BbrVerificationController {
  constructor(private readonly bbrVerificationService: BbrVerificationService) {}

  @Get()
  @ApiOperation({ summary: 'List verifications' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listBbrVerificationSchema, 'query'))
  async list(@Query() listBbrVerificationDto: ListBbrVerificationDto) {
    const verifications = await this.bbrVerificationService.list(listBbrVerificationDto);
    return ResponseService.buildResponse(verifications, 'All verifications retrieved successfully');
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new verification' })
  @UsePipes(new JoiValidationPipe(createBbrVerificationSchema, 'body'))
  async create(
    @Body() createBbrVerificationDto: CreateBbrVerificationDto,
    @GetCurrentUserId() userId: string
  ) {
    const verification = await this.bbrVerificationService.create(createBbrVerificationDto, userId);
    return ResponseService.buildResponse(verification, 'Verification created successfully');
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a verification' })
  @UsePipes(new JoiValidationPipe(updateBbrVerificationSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateBbrVerificationDto: UpdateBbrVerificationDto,
    @GetCurrentUserId() userId: string
  ) {
    const verification = await this.bbrVerificationService.update(
      id,
      updateBbrVerificationDto,
      userId
    );
    return ResponseService.buildResponse(verification, 'Verification updated successfully');
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Get verification by ID' })
  async findById(@Param('id') id: string) {
    const verification = await this.bbrVerificationService.findById(id);
    return ResponseService.buildResponse(verification, 'Verification retrieved successfully');
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a verification' })
  async delete(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    const verification = await this.bbrVerificationService.delete(id, userId);
    return ResponseService.buildResponse(verification, 'Verification deleted successfully');
  }
}
