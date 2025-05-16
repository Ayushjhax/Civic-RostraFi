import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { SectionType } from '../../entities/team-section.entity';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { User } from '../../auth/decorators/user.decorator';

@Controller('teams')
@UseGuards(AuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @User() userId: string,
  ) {
    return this.teamsService.createTeam(userId, createTeamDto);
  }

  @Get(':id')
  async getTeam(@Param('id') teamId: string) {
    return this.teamsService.getTeamWithSections(teamId);
  }

  @Post(':teamId/sections/:sectionType/items/:itemId/follow')
  async followItem(
    @Param('teamId') teamId: string,
    @Param('sectionType') sectionType: SectionType,
    @Param('itemId') itemId: string,
    @User() userId: string,
  ) {
    return this.teamsService.addFollower(teamId, sectionType, itemId, userId);
  }
}
