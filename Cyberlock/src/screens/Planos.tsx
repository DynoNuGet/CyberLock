import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import { PLANOS } from '../dados/planos';
import type { Plano } from '../dados/planos';
import '../main.css';

export const Planos: React.FC = () => {
  const navigate = useNavigate();

  const escolherPlano = (plano: Plano) => {
    navigate(plano.id === 'gratis' ? '/jogos' : `/pagamento/${plano.id}`);
    window.scrollTo({ top: 0 });
  };

  const plans = PLANOS;

  const gamesHighlights = [
    {
      title: 'Análise de senhas',
      description: 'Aprenda a identificar senhas frágeis e a criar rotinas de segurança simples para proteger seus dados.',
      gamesCount: '12 JOGOS',
      xp: '+120 XP',
      level: 'NÍVEL 1',
      rating: '4/5',
    },
    {
      title: 'Golpe ou Não',
      description: 'Treine o olhar para identificar golpes, phishing e fraudes em mensagens, links e ofertas.',
      gamesCount: '12 JOGOS',
      xp: '+150 XP',
      level: 'NÍVEL 2',
      rating: '4/5',
    },
    {
      title: 'Mínimo possível',
      description: 'Aprenda a compartilhar apenas o necessário e a manter seus dados protegidos em situações do dia a dia.',
      gamesCount: '12 JOGOS',
      xp: '+180 XP',
      level: 'NÍVEL 3',
      rating: '4/5',
    },
    {
      title: 'Rema ao Tema',
      description: 'Teste seus conhecimentos com afirmações de verdade ou mito sobre senhas, privacidade e LGPD.',
      gamesCount: '12 GAMES',
      xp: '+200 XP',
      level: 'NÍVEL 4',
      rating: '4/5',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--primary-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={styles.mainContainer}>
        <section style={styles.heroSection}>
          <div style={styles.categoryBadge}>
            <Shield size={12} color="#ffffff" />
            <span>PROTEÇÃO DE DADOS</span>
          </div>

          <h1 style={styles.pixelTitle}>Planos</h1>
          <p style={styles.subtitle}>Escolha o plano que melhor se encaixe com você!</p>
        </section>

        <section style={styles.plansGrid}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                ...styles.planCard,
                ...(plan.isPopular ? styles.popularPlanCard : {}),
              }}
            >
              <div style={styles.planHeader}>
                {plan.badge && (
                  <span
                    style={{
                      ...styles.planBadge,
                      backgroundColor:
                        plan.badgeType === 'popular'
                          ? '#7c3aed'
                          : plan.badgeType === 'discount'
                          ? '#7c3aed'
                          : '#e9d5ff',
                      color:
                        plan.badgeType === 'popular' || plan.badgeType === 'discount'
                          ? '#ffffff'
                          : '#6d28d9',
                    }}
                  >
                    {plan.badge}
                  </span>
                )}
                <h2 style={styles.planTitle}>{plan.title}</h2>
                {plan.price && (
                  <div style={styles.priceContainer}>
                    <span style={styles.priceValue}>{plan.price}</span>
                    {plan.period && <span style={styles.pricePeriod}>{plan.period}</span>}
                  </div>
                )}
              </div>

              <ul style={styles.featuresList}>
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} style={styles.featureItem}>
                    <Check size={16} color="#7c3aed" style={{ minWidth: '16px' }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => escolherPlano(plan)}
                style={{
                  ...styles.planButton,
                  ...(plan.isPopular ? styles.popularButton : styles.defaultButton),
                }}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCenterHeader}>
            <h2 style={styles.sectionPixelTitle}>Por quê CyberLock?</h2>
            <p style={styles.sectionSubtitle}>Aprendizado contínuo, interativo e lúdico</p>
          </div>

          <div style={styles.highlightsGrid}>
            {gamesHighlights.map((item, index) => (
              <div key={index} style={styles.highlightCard}>
                <div style={styles.cardTopRow}>
                  <span style={styles.pillBadge}>{item.gamesCount}</span>
                  <span style={styles.xpBadge}>{item.xp}</span>
                </div>
                <h3 style={styles.highlightTitle}>{item.title}</h3>
                <p style={styles.highlightDesc}>{item.description}</p>
                <div style={styles.cardBottomRow}>
                  <span style={styles.levelBadge}>{item.level}</span>
                  <span style={styles.ratingBadge}>{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  mainContainer: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
    flex: 1,
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '4px 14px',
    borderRadius: '15px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: '0.5px',
  },
  pixelTitle: {
    fontFamily: 'var(--font-pixel)',
    fontSize: '2.2rem',
    color: '#ffffff',
    textShadow: '3px 3px 0px #000',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    alignItems: 'stretch',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    position: 'relative',
  },
  popularPlanCard: {
    border: '2px solid #7c3aed',
    boxShadow: '0 12px 28px rgba(124, 58, 237, 0.3)',
  },
  planHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '20px',
  },
  planBadge: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginTop: '4px',
  },
  priceValue: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  pricePeriod: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: 'bold',
  },
  featuresList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
    flex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8rem',
    color: '#4b5563',
    lineHeight: '1.4',
  },
  planButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  defaultButton: {
    backgroundColor: '#f3e8ff',
    color: '#6d28d9',
  },
  popularButton: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionCenterHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionPixelTitle: {
    fontFamily: 'var(--font-pixel)',
    fontSize: '1.6rem',
    color: '#ffffff',
    textShadow: '2px 2px 0px #000',
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
  },
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillBadge: {
    backgroundColor: '#e9d5ff',
    color: '#6d28d9',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  xpBadge: {
    backgroundColor: '#3b00a5',
    color: '#ffffff',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  highlightTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  highlightDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: '1.4',
    flex: 1,
  },
  cardBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  levelBadge: {
    backgroundColor: '#3b00a5',
    color: '#ffffff',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  ratingBadge: {
    backgroundColor: '#e9d5ff',
    color: '#6d28d9',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '10px',
  },
};