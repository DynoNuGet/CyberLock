import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o pop up se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redireciona para o login depois de sair
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

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
          <span onClick={() => navigate('/jogos')} style={{ ...styles.navLink, cursor: 'pointer' }}>Jogos</span>
          <span onClick={() => navigate('/noticias')} style={{ ...styles.navLink, cursor: 'pointer' }}>Notícias</span>
          <span onClick={() => navigate('/sobre')} style={{ ...styles.navLink, cursor: 'pointer' }}>Sobre nós</span>
          <span onClick={() => navigate('/planos')} style={{ ...styles.navLink, cursor: 'pointer' }}>Planos</span>
        </nav>

        {/* Grupo do Perfil com Pop-up */}
        <div style={styles.profileContainer} ref={dropdownRef}>
          <div 
            style={styles.profileButton} 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
              alt="Avatar"
              style={styles.avatar}
            />
            <div style={styles.userInfo}>
              <span style={styles.userName}>Lina</span>
              <span style={styles.userRole}>Nível 3</span>
            </div>
            <ChevronDown 
              size={16} 
              color="#ffffff" 
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
            />
          </div>

          {/* Menu Pop-up / Dropdown */}
          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <button 
                style={styles.dropdownItem} 
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/conta'); // Podes criar esta rota ou painel futuramente
                }}
              >
                <User size={16} color="#6d28d9" />
                <span>Conta</span>
              </button>

              <div style={styles.divider} />

              <button 
                style={{ ...styles.dropdownItem, color: '#ef4444' }} 
                onClick={handleLogout}
              >
                <LogOut size={16} color="#ef4444" />
                <span>Sair</span>
              </button>
            </div>
          )}
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
  profileContainer: {
    position: 'relative',
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
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 10px)',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '160px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 101,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#3b00a5',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f3e8ff',
    margin: '4px 0',
  },
};