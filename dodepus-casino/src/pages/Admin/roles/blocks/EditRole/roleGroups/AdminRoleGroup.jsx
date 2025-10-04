import RoleGroupSection from './RoleGroupSection.jsx';

export const metadata = {
  key: 'admin',
  label: 'Админ',
};

export default function AdminRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}
