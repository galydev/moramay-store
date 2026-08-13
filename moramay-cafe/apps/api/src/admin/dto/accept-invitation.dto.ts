import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AcceptInvitationDto {
  @IsUUID()
  adminId!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
