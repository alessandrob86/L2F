export const PlaceholderPage = ({ title }: { title: string }) => {
    return (
        <main style={{
            paddingTop: '120px',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div className="container">
                <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>{title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
                    Pagina in costruzione. La sezione {title.toLowerCase()} sarà disponibile a breve.
                </p>
            </div>
        </main>
    );
};
