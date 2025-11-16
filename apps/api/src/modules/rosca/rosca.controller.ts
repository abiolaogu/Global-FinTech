import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoscaService, CreateCircleDto, JoinCircleDto, MakeContributionDto } from './rosca.service';

@Controller('rosca')
export class RoscaController {
  constructor(private readonly roscaService: RoscaService) {}

  /**
   * Create a new ROSCA circle
   * POST /rosca/circles
   */
  @Post('circles')
  @HttpCode(HttpStatus.CREATED)
  async createCircle(@Body() dto: CreateCircleDto) {
    return this.roscaService.createCircle(dto);
  }

  /**
   * Join a ROSCA circle
   * POST /rosca/circles/:circleId/join
   */
  @Post('circles/:circleId/join')
  @HttpCode(HttpStatus.OK)
  async joinCircle(@Param('circleId') circleId: string, @Body() dto: Omit<JoinCircleDto, 'circleId'>) {
    return this.roscaService.joinCircle({ ...dto, circleId });
  }

  /**
   * Make contribution to circle
   * POST /rosca/contributions
   */
  @Post('contributions')
  @HttpCode(HttpStatus.CREATED)
  async makeContribution(@Body() dto: MakeContributionDto) {
    return this.roscaService.makeContribution(dto);
  }

  /**
   * Get user's circles
   * GET /rosca/users/:userId/circles
   */
  @Get('users/:userId/circles')
  async getUserCircles(@Param('userId') userId: string) {
    return this.roscaService.getUserCircles(userId);
  }

  /**
   * Get circle details
   * GET /rosca/circles/:circleId
   */
  @Get('circles/:circleId')
  async getCircleDetails(@Param('circleId') circleId: string) {
    return this.roscaService.getCircleDetails(circleId);
  }

  /**
   * Get user contributions for a circle
   * GET /rosca/circles/:circleId/users/:userId/contributions
   */
  @Get('circles/:circleId/users/:userId/contributions')
  async getUserContributions(
    @Param('circleId') circleId: string,
    @Param('userId') userId: string,
  ) {
    return this.roscaService.getUserContributions(userId, circleId);
  }

  /**
   * Search for public circles
   * GET /rosca/circles/search
   */
  @Get('circles/search')
  async searchCircles(
    @Query('currency') currency?: string,
    @Query('maxContribution') maxContribution?: string,
    @Query('frequency') frequency?: string,
  ) {
    return this.roscaService.searchCircles({
      currency,
      maxContribution,
      frequency,
    });
  }
}
