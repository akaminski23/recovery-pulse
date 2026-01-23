/**
 * Recovery Pulse - 404 Not Found
 */

import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../components/GradientBackground';
import { SapphireButton } from '../components/SapphireButton';
import { SafeText, HeadlineText } from '../components/SafeText';
import { SPACING } from '../constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.content}>
        <SafeText variant="displayLarge" style={styles.icon}>
          ✦
        </SafeText>
        <HeadlineText>Page Not Found</HeadlineText>
        <SafeText variant="body" style={styles.description}>
          The page you're looking for doesn't exist.
        </SafeText>
        <SapphireButton
          title="Go to Dashboard"
          onPress={() => router.replace('/')}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  description: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
