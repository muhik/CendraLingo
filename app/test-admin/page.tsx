export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function TestAdminPage() {
    return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#dcfce7' }}>
            <h1 style={{ color: '#166534', fontSize: '24px', fontWeight: 'bold' }}>
                ADMIN TEST ROUTE IS WORKING!
            </h1>
            <p style={{ color: '#15803d', marginTop: '10px' }}>
                Jika Anda melihat ini, berarti server & layout fungsi dengan baik.
                Masalahnya spesifik ada di path <code>/admin</code> yang lama (mungkin cache error).
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px' }}>
                Runtime: Node.js (Forced)
            </p>
        </div>
    );
}
