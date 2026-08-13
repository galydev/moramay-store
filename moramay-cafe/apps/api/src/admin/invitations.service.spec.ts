import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminInvitationsService } from './invitations.service';
import { SupabaseService } from '../auth/supabase.service';
import { ResendEmailService } from './email/resend-email.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

function buildQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    single: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

describe('AdminInvitationsService', () => {
  const invitedBy: AuthenticatedUser = { id: 'admin-1', email: 'admin@example.com', role: 'admin' };
  let resendEmailService: jest.Mocked<Pick<ResendEmailService, 'sendAdminInvitation'>>;

  beforeEach(() => {
    resendEmailService = { sendAdminInvitation: jest.fn().mockResolvedValue(undefined) };
  });

  const buildConfigService = () => ({ get: jest.fn().mockReturnValue('http://localhost:3000') }) as any;

  it('invites a new admin and sends the email', async () => {
    const fromMock = jest.fn();
    // 1) check existing admin -> none
    fromMock.mockReturnValueOnce(buildQueryBuilder({ data: null, error: null }));
    // 2) insert admin row
    fromMock.mockReturnValueOnce(
      buildQueryBuilder({
        data: {
          id: 'new-admin-id',
          full_name: 'New Admin',
          email: 'new@example.com',
          invited_by: 'admin-1',
          status: 'invited',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      }),
    );

    const authAdmin = {
      generateLink: jest.fn().mockResolvedValue({ data: { user: { id: 'new-admin-id' } }, error: null }),
    };
    const supabaseService = {
      getClient: () => ({ from: fromMock, auth: { admin: authAdmin } }),
    } as unknown as SupabaseService;

    const service = new AdminInvitationsService(
      supabaseService,
      resendEmailService as unknown as ResendEmailService,
      buildConfigService(),
    );

    const result = await service.inviteAdmin({ email: 'new@example.com', fullName: 'New Admin' }, invitedBy);

    expect(result.status).toBe('invited');
    expect(resendEmailService.sendAdminInvitation).toHaveBeenCalledWith(
      'new@example.com',
      'New Admin',
      expect.stringContaining('new-admin-id'),
    );
  });

  it('rejects inviting an email that already belongs to an admin', async () => {
    const fromMock = jest.fn().mockReturnValueOnce(buildQueryBuilder({ data: { id: 'existing' }, error: null }));
    const supabaseService = { getClient: () => ({ from: fromMock, auth: { admin: {} } }) } as unknown as SupabaseService;

    const service = new AdminInvitationsService(
      supabaseService,
      resendEmailService as unknown as ResendEmailService,
      buildConfigService(),
    );

    await expect(
      service.inviteAdmin({ email: 'existing@example.com', fullName: 'Existing' }, invitedBy),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('activates the account when accepting a pending invitation', async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce(
      buildQueryBuilder({ data: { id: 'admin-2', status: 'invited' }, error: null }),
    );
    fromMock.mockReturnValueOnce(
      buildQueryBuilder({
        data: {
          id: 'admin-2',
          full_name: 'Invitee',
          email: 'invitee@example.com',
          invited_by: 'admin-1',
          status: 'active',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      }),
    );

    const authAdmin = { updateUserById: jest.fn().mockResolvedValue({ error: null }) };
    const supabaseService = {
      getClient: () => ({ from: fromMock, auth: { admin: authAdmin } }),
    } as unknown as SupabaseService;

    const service = new AdminInvitationsService(
      supabaseService,
      resendEmailService as unknown as ResendEmailService,
      buildConfigService(),
    );

    const result = await service.acceptInvitation({ adminId: 'admin-2', password: 'secret-pass' });

    expect(result.status).toBe('active');
    expect(authAdmin.updateUserById).toHaveBeenCalledWith('admin-2', { password: 'secret-pass' });
  });

  it('throws NotFoundException when the invitation does not exist', async () => {
    const fromMock = jest.fn().mockReturnValueOnce(buildQueryBuilder({ data: null, error: null }));
    const supabaseService = { getClient: () => ({ from: fromMock, auth: { admin: {} } }) } as unknown as SupabaseService;

    const service = new AdminInvitationsService(
      supabaseService,
      resendEmailService as unknown as ResendEmailService,
      buildConfigService(),
    );

    await expect(service.acceptInvitation({ adminId: 'missing', password: 'secret-pass' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
