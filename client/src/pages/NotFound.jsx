import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="text-center px-6 max-w-lg">
        <h1 className="text-9xl font-black text-gray-100 leading-none select-none">404</h1>
        <h2 className="text-3xl font-bold text-daInfo-dark tracking-tight -mt-6 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-daInfo-dark text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
