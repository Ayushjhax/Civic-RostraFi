import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Team } from './team.entity';

export enum SectionType {
  PREMIUM_DIAMOND = 'premium_diamond',
  PREMIUM_GOLD = 'premium_gold',
  PREMIUM_SILVER = 'premium_silver',
  PREMIUM_BRONZE = 'premium_bronze',
  OTHERS = 'others',
}

@Entity('team_sections')
export class TeamSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SectionType,
  })
  type: SectionType;

  @Column('jsonb', { default: [] })
  items: Array<{
    id: string;
    name: string;
    image: string;
    description: string;
    followers: string[];
  }>;

  @ManyToOne(() => Team, (team) => team.sections)
  team: Team;

  @Column()
  teamId: string;
}
