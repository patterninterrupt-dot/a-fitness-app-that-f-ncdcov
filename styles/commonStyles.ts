
import { StyleSheet } from 'react-native';

// Pattern Interrupt Training brand colors - pink/magenta and black
export const colors = {
  // Light theme - Pattern Interrupt Training brand
  background: '#FAFAFA',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#D91B7C', // Magenta/Pink from logo
  secondary: '#1A1A1A', // Black from logo
  accent: '#FF4DA6', // Lighter pink accent
  card: '#FFFFFF',
  highlight: '#FFF0F7',
  border: '#F0F0F0',
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
