import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamSection } from '../../entities/team-section.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { v4 as uuidv4 } from 'uuid';
import { SectionType } from '../../entities/team-section.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(TeamSection)
    private teamSectionsRepository: Repository<TeamSection>,
  ) {}

  async createTeam(
    userId: string,
    createTeamDto: CreateTeamDto,
  ): Promise<Team> {
    const team = this.teamsRepository.create({
      name: createTeamDto.name,
      userId,
      sections: createTeamDto.sections.map((sectionDto) => {
        return this.teamSectionsRepository.create({
          type: sectionDto.type,
          items: sectionDto.items.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
        });
      }),
    });

    return this.teamsRepository.save(team);
  }

  async getTeamWithSections(teamId: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId },
      relations: ['sections'],
    });

    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    return team;
  }

  async addFollower(
    teamId: string,
    sectionType: SectionType,
    itemId: string,
    userId: string,
  ): Promise<void> {
    const section = await this.teamSectionsRepository.findOne({
      where: { teamId, type: sectionType },
    });

    if (section) {
      section.items = section.items.map((item) => {
        if (item.id === itemId && !item.followers.includes(userId)) {
          return {
            ...item,
            followers: [...item.followers, userId],
          };
        }
        return item;
      });

      await this.teamSectionsRepository.save(section);
    }
  }
}
