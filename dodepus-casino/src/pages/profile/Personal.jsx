import AccountIdBlock from './blocks/Personal/AccountIdBlock.jsx';
import NicknameBlock from './blocks/Personal/NicknameBlock.jsx';
import NameBlock from './blocks/Personal/NameBlock.jsx';
import GenderDobBlock from './blocks/Personal/GenderDobBlock.jsx';
import SocialStatusBlock from './blocks/Personal/SocialStatusBlock.jsx';
import AddressBlock from './blocks/Personal/AddressBlock.jsx';
import ContactsBlock from './blocks/Personal/ContactsBlock.jsx';
import AuthenticatorBlock from './blocks/Personal/AuthenticatorBlock.jsx';

export default function Personal() {
  return (
    <div className="d-flex flex-column gap-3">
      <AccountIdBlock />
      <NicknameBlock />
      <NameBlock />
      <GenderDobBlock />
      <SocialStatusBlock />
      <AddressBlock />
      <ContactsBlock />
      <AuthenticatorBlock /> {/* ← новый блок */}
    </div>
  );
}
