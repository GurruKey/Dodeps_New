import { ProfileBlocksLayout } from '@/pages/profile/layout/blocks';
import {
  AccountIdBlock,
  NameBlock,
  GenderDobBlock,
  SocialStatusBlock,
  NicknameBlock,
  PhoneBlock,
  EmailBlock,
  AddressBlock,
  SavePersonalBlock,
} from '../blocks';

export default function ProfilePersonalPage() {
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
      <SavePersonalBlock />
    </ProfileBlocksLayout>
  );
}
