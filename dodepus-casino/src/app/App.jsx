import { Container } from 'react-bootstrap';
import { Header, Footer } from '@/shared/ui';
import { AppRoutes } from './routing';

export default function App() {
  return (
    // Каркас: колонка на всю высоту вьюпорта
    <div className="d-flex flex-column min-vh-100">
      <Header />

      {/* Контент растягивается и «толкает» футер вниз */}
      <main className="flex-grow-1">
        <Container className="py-4">
          <AppRoutes />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
