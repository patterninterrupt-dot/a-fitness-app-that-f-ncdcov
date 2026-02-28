
import { StyleSheet } from 'react-native';

// Pattern Interrupt Training brand colors - pink/magenta and black
export const colors = {
  // Light theme - Pattern Interrupt Training brand
  background: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#D91B7C', // Magenta/Pink from logo
  secondary: '#1A1A1A', // Black from logo
  accent: '#FF4DA6', // Lighter pink accent
  card: '#FFFFFF',
  highlight: '#FFE5F3',
  border: '#E5E7EB',
  success: '#10B981',
  
  // Dark theme
  darkBackground: '#0F0F0F',
  darkText: '#F1F5F9',
  darkTextSecondary: '#94A3B8',
  darkCard: '#1E1E1E',
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
