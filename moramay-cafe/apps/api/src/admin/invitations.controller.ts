import { Body, Controller, Post } from '@nestjs/common';
import { AdminOnly } from './decorators/admin-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AdminInvitationsService } from './invitations.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

/**
 * T-055: admin invitation flow. `POST /admin/invitations` is admin-only;
 * `POST /admin/invitations/accept` is public since the invitee has no
 * session yet — it identifies itself via the `adminId` from the emailed
 * invitation link.
 */
@Controller('admin/invitations')
export class AdminInvitationsController {
  constructor(private readonly invitationsService: AdminInvitationsService) {}

  @Post()
  @AdminOnly()
  invite(@Body() dto: InviteAdminDto, @CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.inviteAdmin(dto, user);
  }

  @Post('accept')
  accept(@Body() dto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(dto);
  }
}
