import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CatalogCategoriesSections } from '../blocks/index.js';
import { useCatalogCategories } from '../hooks/index.js';

export default function CategoriesPage() {
  const categories = useCatalogCategories();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Категории</h2>
        <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
          В лобби
        </Button>
      </div>

      <CatalogCategoriesSections categories={categories} />
    </>
  );
}
