import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Team } from './team.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Team, (team) => team.user)
  teams: Team[];
}
