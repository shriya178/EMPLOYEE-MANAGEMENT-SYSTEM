import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: 'Employee Management System',
  description: 'Employee Management System using Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
