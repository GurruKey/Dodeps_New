import RoleGroupSection from './RoleGroupSection.jsx';

export const metadata = {
  key: 'moderator',
  label: 'Модератор',
};

export default function ModeratorRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}
