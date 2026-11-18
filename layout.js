import './globals.css';

export const metadata = {
  title: 'Mensaje para Leandro | Libro de visitas',
  description: 'Dejá tu mensaje para Leandro en su libro de visitas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
