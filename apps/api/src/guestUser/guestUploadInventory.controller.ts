import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GuestUserService } from './guast-user.service';
import { GuestUploadInventoryDto, guestUploadInventorySchema } from './guest-upload-inventory.dto';

@ApiTags('Guest Upload Inventory')
@Controller('guest-upload-inventory')
export class GuestUploadInventoryController {
  constructor(private readonly guestUploadInventoryService: GuestUserService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest Upload Inventory',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(guestUploadInventorySchema, 'body'))
  async guestUploadInventory(@Body() body: GuestUploadInventoryDto) {
    const resp = await this.guestUploadInventoryService.uploadInventory(body);
    return ResponseService.buildResponse(resp, 'Inventory uploaded successfully');
  }
}
