import {
  AccountIdBlock,
  AddressBlock,
  ContactsBlock,
  GenderDobBlock,
  NameBlock,
  NicknameBlock,
  SavePersonalBlock,
  SocialStatusBlock,
  // AuthenticatorBlock,
} from './blocks';

export default function Personal() {
  return (
    <div className="d-flex flex-column gap-3">
      {/* Кнопка сверху, по центру */}
      <AccountIdBlock />
      <NicknameBlock />
      <NameBlock />
      <GenderDobBlock />
      <SocialStatusBlock />
      <AddressBlock />
      <ContactsBlock />
      <SavePersonalBlock />
      {/* <AuthenticatorBlock /> */}
    </div>
  );
}
