import {
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SectionType } from '../../../entities/team-section.entity';

class SectionItemDto {
  @IsString()
  name: string;

  @IsString()
  image: string;

  @IsString()
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  followers: string[];
}

class TeamSectionDto {
  @IsEnum(SectionType)
  type: SectionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionItemDto)
  items: SectionItemDto[];
}

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamSectionDto)
  sections: TeamSectionDto[];
}
