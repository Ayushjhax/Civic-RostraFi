import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async signUp(email: string, password: string, name: string) {
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signUp({
        email,
        password,
      });

    if (authError) throw new UnauthorizedException(authError.message);

    const user = this.usersRepository.create({
      id: authData.user?.id ?? '',
      email,
      name,
    });

    return this.usersRepository.save(user);
  }

  async signIn(email: string, password: string) {
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw new UnauthorizedException(authError.message);

    const user = await this.usersRepository.findOne({
      where: { id: authData.user.id },
    });

    return {
      user,
      session: authData.session,
    };
  }
}
