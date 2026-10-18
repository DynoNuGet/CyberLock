import React from 'react';
import { Star, Zap } from 'lucide-react';

export interface GameCardProps {
  title: string;
  description: string;
  level: string;
  rating: string;
  xp: string;
  imageUrl: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  level,
  rating,
  xp,
  imageUrl,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img src={imageUrl} alt={title} style={styles.image} />
        <span style={styles.levelBadge}>{level}</span>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.description}>{description}</p>

        <div style={styles.footer}>
          <div style={styles.metricBadge}>
            <Star size={12} color="#7c3aed" />
            <span>{rating}</span>
          </div>
          <div style={styles.metricBadge}>
            <Zap size={12} color="#7c3aed" />
            <span>{xp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '270px',
    transition: 'transform 0.2s',
  },
  imageContainer: {
    position: 'relative',
    height: '140px',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  levelBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(233, 213, 255, 0.9)',
    color: '#6d28d9',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  title: {
    color: '#2e1065',
    fontSize: '1rem',
    fontWeight: '700',
  },
  description: {
    color: '#6b21a8',
    fontSize: '0.75rem',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '8px',
  },
  metricBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f3e8ff',
    padding: '4px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#6d28d9',
  },
};