import './globals.css';

export const metadata = {
  title: 'Libro de visitas | Dejá tu huella',
  description: 'Un rincón para dejar un saludo, un recuerdo o unas palabras.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
