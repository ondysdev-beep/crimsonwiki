export default function Loading() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 16px',
    }}>
      <div style={{
        width: 32, height: 32, border: '2px solid var(--border)',
        borderTopColor: 'var(--crimson-bright)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: 16,
      }} />
      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading...</p>
    </div>
  );
}
