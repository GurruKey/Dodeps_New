import RoleGroupSection from './RoleGroupSection.jsx';

export const metadata = {
  key: 'staff',
  label: 'Админ стаф',
};

export default function StaffRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}
