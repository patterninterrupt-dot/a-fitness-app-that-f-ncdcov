
import { StyleSheet } from 'react-native';

// Motivational fitness color palette - energetic and empowering
export const colors = {
  // Light theme
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#FF6B35', // Energetic orange
  secondary: '#4ECDC4', // Motivational teal
  accent: '#FFE66D', // Bright yellow
  card: '#F9FAFB',
  highlight: '#FEF3C7',
  border: '#E5E7EB',
  success: '#10B981',
  
  // Dark theme
  darkBackground: '#0F172A',
  darkText: '#F1F5F9',
  darkTextSecondary: '#94A3B8',
  darkCard: '#1E293B',
  darkBorder: '#334155',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
