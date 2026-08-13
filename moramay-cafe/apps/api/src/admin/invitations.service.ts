import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../auth/supabase.service';
import { ResendEmailService } from './email/resend-email.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  invitedBy: string | null;
  status: 'invited' | 'active' | 'revoked';
  createdAt: string;
}

/**
 * T-055: invites new admins (creates the Supabase Auth user + `admins`
 * row, sends the invitation email via Resend) and lets the invitee accept
 * by setting a password, activating their account.
 */
@Injectable()
export class AdminInvitationsService {
  private readonly logger = new Logger(AdminInvitationsService.name);
  private readonly webAppUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly resendEmailService: ResendEmailService,
    private readonly configService: ConfigService,
  ) {
    this.webAppUrl = this.configService.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
  }

  async inviteAdmin(dto: InviteAdminDto, invitedBy: AuthenticatedUser): Promise<AdminAccount> {
    try {
      const client = this.supabaseService.getClient();

      const { data: existing } = await client
        .from('admins')
        .select('id')
        .eq('email', dto.email)
        .maybeSingle();

      if (existing) {
        throw new ConflictException('Ya existe un administrador con este correo.');
      }

      const { data: generated, error: generateError } = await client.auth.admin.generateLink({
        type: 'invite',
        email: dto.email,
      });

      if (generateError || !generated?.user) {
        throw new InternalServerErrorException(
          generateError?.message ?? 'No se pudo crear el usuario invitado en Supabase Auth.',
        );
      }

      const { data: admin, error: adminError } = await client
        .from('admins')
        .insert({
          id: generated.user.id,
          full_name: dto.fullName,
          email: dto.email,
          invited_by: invitedBy.id,
          status: 'invited',
        })
        .select('*')
        .single();

      if (adminError || !admin) {
        throw new InternalServerErrorException(
          adminError?.message ?? 'No se pudo registrar al administrador.',
        );
      }

      const acceptUrl = `${this.webAppUrl}/admin/accept-invitation?adminId=${generated.user.id}`;
      await this.resendEmailService.sendAdminInvitation(dto.email, dto.fullName, acceptUrl);

      return this.mapAdmin(admin);
    } catch (error) {
      this.logger.error(
        `Error invitando administrador ${dto.email}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async acceptInvitation(dto: AcceptInvitationDto): Promise<AdminAccount> {
    try {
      const client = this.supabaseService.getClient();

      const { data: admin, error: findError } = await client
        .from('admins')
        .select('*')
        .eq('id', dto.adminId)
        .maybeSingle();

      if (findError) throw new InternalServerErrorException(findError.message);
      if (!admin) throw new NotFoundException(`Invitación ${dto.adminId} no encontrada.`);
      if (admin.status !== 'invited') {
        throw new ConflictException('Esta invitación ya fue aceptada o revocada.');
      }

      const { error: updateUserError } = await client.auth.admin.updateUserById(dto.adminId, {
        password: dto.password,
      });

      if (updateUserError) {
        throw new InternalServerErrorException(updateUserError.message);
      }

      const { data: activated, error: activateError } = await client
        .from('admins')
        .update({ status: 'active' })
        .eq('id', dto.adminId)
        .select('*')
        .single();

      if (activateError || !activated) {
        throw new InternalServerErrorException(
          activateError?.message ?? 'No se pudo activar la cuenta.',
        );
      }

      return this.mapAdmin(activated);
    } catch (error) {
      this.logger.error(
        `Error aceptando invitación ${dto.adminId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  private mapAdmin(row: Record<string, unknown>): AdminAccount {
    return {
      id: row.id as string,
      fullName: row.full_name as string,
      email: row.email as string,
      invitedBy: (row.invited_by as string | null) ?? null,
      status: row.status as AdminAccount['status'],
      createdAt: row.created_at as string,
    };
  }
}
