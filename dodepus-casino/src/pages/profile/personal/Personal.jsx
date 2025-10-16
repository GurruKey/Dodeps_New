import { ProfileBlocksLayout } from '../layout/blocks';
import {
  AccountIdBlock,
  NameBlock,
  GenderDobBlock,
  SocialStatusBlock,
  NicknameBlock,
  ContactsBlock,
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
      <ContactsBlock />
      <AddressBlock />
      <AuthenticatorBlock />
      <SavePersonalBlock />
    </ProfileBlocksLayout>
  );
}
