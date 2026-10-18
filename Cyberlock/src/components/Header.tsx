import React from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div style={{ ...styles.logoGroup, cursor: 'pointer' }} onClick={() => navigate('/home')}>
                    <div style={styles.logoIcon}>
                        <Shield size={20} color="#ffffff" />
                    </div>
                    <span style={styles.logoText}>CYBERLOCK</span>
                </div>

                <nav style={styles.nav}>
                    <span onClick={() => navigate('/home')} style={{ ...styles.navLink, ...styles.navLinkActive, cursor: 'pointer' }}>Início</span>
                    <a
                        href="#jogos"
                        style={styles.navLink}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/jogos');
                        }}
                    >
                        Jogos
                    </a>
                    <a 
                        href="#noticias" 
                        style={styles.navLink} 
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/noticias');
                        }}
                    >
                        Notícias
                    </a>
                    <a 
                        href="#sobre" 
                        style={styles.navLink} 
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/sobre');
                        }}
                    >
                        Sobre nós
                    </a>
                    <a 
                        href="#planos" 
                        style={styles.navLink} 
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/planos');
                        }}
                    >
                        Planos
                    </a>
                </nav>

                <div style={styles.profileButton} onClick={() => navigate('/')} title="Sair / Voltar ao Login">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                        alt="Avatar"
                        style={styles.avatar}
                    />
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>Lina</span>
                        <span style={styles.userRole}>Nível 3</span>
                    </div>
                    <ChevronDown size={16} color="#ffffff" />
                </div>
            </div>
        </header>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        width: '100%',
        backgroundColor: 'rgba(59, 0, 165, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 24px',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px',
    },
    logoGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: {
        backgroundColor: '#7c3aed',
        padding: '8px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontFamily: 'var(--font-pixel)',
        fontSize: '1rem',
        color: '#ffffff',
        letterSpacing: '1px',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: '4px',
        borderRadius: '25px',
    },
    navLink: {
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: '600',
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.2s',
    },
    navLinkActive: {
        backgroundColor: '#ffffff',
        color: '#3b00a5',
    },
    profileButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: '6px 14px 6px 6px',
        borderRadius: '25px',
        cursor: 'pointer',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: '1.2',
    },
    userName: {
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#ffffff',
    },
    userRole: {
        fontSize: '0.65rem',
        color: 'rgba(255, 255, 255, 0.7)',
    },
};