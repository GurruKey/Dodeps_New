import RoleGroupSection from './RoleGroupSection.jsx';

export const metadata = {
  key: 'intern',
  label: 'Стажёр',
};

export default function InternRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}
