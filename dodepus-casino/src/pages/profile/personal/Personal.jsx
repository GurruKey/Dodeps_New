import { ProfileBlocksLayout } from '../layout/blocks';
import {
  AccountIdBlock,
  NameBlock,
  GenderDobBlock,
  SocialStatusBlock,
  NicknameBlock,
  PhoneBlock,
  EmailBlock,
  AddressBlock,
  AuthenticatorBlock,
  SavePersonalBlock,
} from './blocks';

export default function Personal() {
  return (
    <ProfileBlocksLayout>
      <AccountIdBlock />
      <NameBlock />
      <GenderDobBlock />
      <SocialStatusBlock />
      <NicknameBlock />
      <PhoneBlock />
      <EmailBlock />
      <AddressBlock />
      <AuthenticatorBlock />
      <SavePersonalBlock />
    </ProfileBlocksLayout>
  );
}
