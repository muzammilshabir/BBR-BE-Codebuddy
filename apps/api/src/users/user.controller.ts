import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { ForgotPasswordDto, forgotPasswordSchema } from './dto/forgotPassword.dto';
import { ResetPasswordDto, resetPasswordSchema } from './dto/resetPassword.dto'; // Add this import
import { UserRole } from './enum/user.enum';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @UsePipes(new JoiValidationPipe(createUserSchema, 'body'))
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return ResponseService.buildResponse({ user }, 'User registered successfully');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link' })
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema, 'body'))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userService.forgotPassword(forgotPasswordDto.email);
    return ResponseService.buildResponse({}, 'Password reset link sent successfully');
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a token' })
  @UsePipes(new JoiValidationPipe(resetPasswordSchema, 'body'))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(
      resetPasswordDto.id,
      resetPasswordDto.token,
      resetPasswordDto.password
    );
    return ResponseService.buildResponse({}, 'Password has been reset successfully');
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'For verifying the email' })
  async verifyEmail(@Query('token') token: string, @Query('email') email: string) {
    try {
      const result = await this.userService.verifyUserEmail(token, email, UserRole.BUYER);
      return { message: 'Email verified successfully', result };
    } catch (error) {
      return { error: error.message };
    }
  }
}
