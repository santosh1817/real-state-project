import './globals.css';
import Providers from '../store/Providers';
import Header from '../components/Header';

export const metadata = {
  title: {
    default: 'EstateFlow | Verified Real Estate Listings',
    template: '%s | EstateFlow'
  },
  description: 'Search, list, and inquire on verified real estate properties with fast filters and SEO-friendly property pages.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
