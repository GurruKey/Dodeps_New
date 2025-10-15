import { Placeholder } from 'react-bootstrap';

export default function renderPlaceholderItems(length = 3) {
  return Array.from({ length }).map((_, index) => (
    <Placeholder key={index} as="div" animation="glow">
      <Placeholder xs={12} />
    </Placeholder>
  ));
}
