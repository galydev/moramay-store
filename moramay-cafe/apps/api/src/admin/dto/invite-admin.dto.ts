import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;
}
