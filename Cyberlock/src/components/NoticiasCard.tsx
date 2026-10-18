import React from 'react';
import { Eye, ArrowRight } from 'lucide-react';

export interface NewsCardProps {
  category: string;
  views: string;
  title: string;
  description: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  imageUrl: string;
}

export const NoticiasCard: React.FC<NewsCardProps> = ({
  category,
  views,
  title,
  description,
  authorName,
  authorRole,
  authorAvatar,
  imageUrl,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img src={imageUrl} alt={title} style={styles.image} />
      </div>

      <div style={styles.content}>
        <div style={styles.metaRow}>
          <span style={styles.categoryBadge}>{category}</span>
          <div style={styles.viewsBadge}>
            <Eye size={12} color="#6d28d9" />
            <span>{views}</span>
          </div>
        </div>

        <h3 style={styles.title}>{title}</h3>
        <p style={styles.description}>{description}</p>

        <div style={styles.footer}>
          <div style={styles.authorGroup}>
            <img src={authorAvatar} alt={authorName} style={styles.authorAvatar} />
            <div style={styles.authorInfo}>
              <span style={styles.authorName}>{authorName}</span>
              <span style={styles.authorRole}>{authorRole}</span>
            </div>
          </div>

          <button style={styles.readMoreBtn}>
            Ler mais <ArrowRight size={14} />
          </button>
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
    maxWidth: '540px',
  },
  imageContainer: {
    height: '200px',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#e9d5ff',
    color: '#6d28d9',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  viewsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    color: '#6d28d9',
    fontWeight: '600',
  },
  title: {
    color: '#2e1065',
    fontSize: '1.1rem',
    fontWeight: '700',
    lineHeight: '1.3',
  },
  description: {
    color: '#5b21b6',
    fontSize: '0.8rem',
    lineHeight: '1.5',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    paddingTop: '12px',
    borderTop: '1px solid #f3e8ff',
  },
  authorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#2e1065',
  },
  authorRole: {
    fontSize: '0.65rem',
    color: '#7c3aed',
  },
  readMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#7c3aed',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};