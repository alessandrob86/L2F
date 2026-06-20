import { CONTACT } from '../lib/contact';

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
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px' }}>{title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '50ch', margin: '0 auto' }}>
                    Questa sezione sarà online a breve. Nel frattempo siamo a tua
                    disposizione: scrivi a{' '}
                    <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent-hover)' }}>{CONTACT.email}</a>{' '}
                    o chiama il{' '}
                    <a href={CONTACT.phoneHref} style={{ color: 'var(--accent-hover)' }}>{CONTACT.phone}</a>.
                </p>
            </div>
        </main>
    );
};
