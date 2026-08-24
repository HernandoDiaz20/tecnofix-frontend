import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClientLayout } from '@/layouts/ClientLayout';
import { Home } from '@/pages/Home';
import { Catalog } from '@/pages/Catalog';
import { ProductDetail } from '@/pages/ProductDetail';
import { Checkout } from '@/pages/Checkout';
import { Services } from '@/pages/Services';
import { Booking } from '@/pages/Booking';
import { Tracking } from '@/pages/Tracking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="productos" element={<Catalog />} />
          <Route path="productos/:id" element={<ProductDetail />} />
          <Route path="carrito" element={<Checkout />} />
          <Route path="servicios" element={<Services />} />
          <Route path="agendar" element={<Booking />} />
          <Route path="seguimiento" element={<Tracking />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
