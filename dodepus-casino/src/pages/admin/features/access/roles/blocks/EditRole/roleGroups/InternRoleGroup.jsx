import RoleGroupSection from './RoleGroupSection.jsx';

const metadata = {
  key: 'intern',
  label: 'Стажёр',
};

function InternRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}

InternRoleGroup.metadata = metadata;

export default InternRoleGroup;
