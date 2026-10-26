import EditorialAssetsClient from './client';
import './editorial-assets.css';
export const dynamic = 'force-dynamic';
// Public shell only. All candidate data and operations require the existing owner/scope API guard.
export default function EditorialAssetsPage() { return <EditorialAssetsClient />; }
