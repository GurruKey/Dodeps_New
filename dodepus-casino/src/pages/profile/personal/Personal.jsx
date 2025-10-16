import { ProfileBlocksLayout } from '../layout/blocks';
import { PersonalDataBlock, PersonalContactsBlock, PersonalPasswordBlock } from './blocks';

export default function Personal() {
  return (
    <ProfileBlocksLayout>
      <PersonalDataBlock />
      <PersonalContactsBlock />
      <PersonalPasswordBlock />
    </ProfileBlocksLayout>
  );
}
