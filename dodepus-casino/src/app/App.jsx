import { Container } from 'react-bootstrap';
import Header from '../shared/ui/Header.jsx';
import Footer from '../shared/ui/Footer.jsx';
import AppRoutes from './routes.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Container className="py-4">
          <AppRoutes />
        </Container>
      </main>
      <Footer />
    </>
  );
}
