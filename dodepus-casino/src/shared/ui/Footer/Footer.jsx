import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-body-tertiary py-3 mt-5 border-top">
      <Container>
        <small className="text-body-secondary">
          © {new Date().getFullYear()} Dodepus. 18+.
        </small>
      </Container>
    </footer>
  );
}
