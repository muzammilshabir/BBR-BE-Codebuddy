import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { LoginDto, loginSchema } from './dto/createLogin.dto';
import { ForgotPasswordDto, forgotPasswordSchema } from './dto/forgotPassword.dto';
import { ResetPasswordDto, resetPasswordSchema } from './dto/resetPassword.dto'; // Add this import
import { Body, Controller, Post, UsePipes, Get, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ResponseService } from '../common/services/response.service';


@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @UsePipes(new JoiValidationPipe(createUserSchema))
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return ResponseService.buildResponse({ user }, 'User registered successfully');
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      await this.userService.resendVerificationEmail(user);
      return ResponseService.buildResponse(null, 'User not verified. Verification email resent.');
    }
    const token = await this.userService.generateJwtToken(user);
    return ResponseService.buildResponse({ token }, 'Login successful');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link' })
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userService.forgotPassword(forgotPasswordDto.email);
    return ResponseService.buildResponse({}, 'Password reset link sent successfully');
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a token' })
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(resetPasswordDto.id, resetPasswordDto.token, resetPasswordDto.password);
    return ResponseService.buildResponse({}, 'Password has been reset successfully');
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'For verifying the email' })
  async verifyEmail(@Query('token') token: string, @Query('uid') _id: string) {
    try {
      const result = await this.userService.verifyUserEmail(token, _id);
      return { message: 'Email verified successfully', result };
    } catch (error) {
      return { error: error.message };
    }
  }
}
