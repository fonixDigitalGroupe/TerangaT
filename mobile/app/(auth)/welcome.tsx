import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../src/theme';

const SLIDES = [
  {
    img: require('../../assets/hero-market.jpg'),
    text: 'Transférez de l’argent en toute confiance.',
  },
  {
    img: require('../../assets/hero-agent.png'),
    text: 'Wave & Orange Money, en un seul endroit.',
  },
  {
    img: require('../../assets/hero-2.jpg'),
    text: 'Dépôts et retraits rapides, partout au Sénégal.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  // Auto-advance the carousel every 4 seconds.
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        listRef.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [width]);

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <ImageBackground source={item.img} resizeMode="cover" style={{ width, flex: 1 }}>
            <View style={styles.overlay} />
            <View style={styles.textWrap}>
              <Text style={styles.slideText}>{item.text}</Text>
            </View>
          </ImageBackground>
        )}
      />

      {/* Logo (minimalist wordmark), fixed at the top */}
      <View style={[styles.logoWrap, { top: insets.top + spacing.xl }]}>
        <Text style={styles.logoWord}>Téranga</Text>
        <Text style={styles.logoSub}>TRANSFERT</Text>
      </View>

      {/* Dots + action buttons, fixed at the bottom */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.xs }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.btnPrimaryText}>Inscription</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnSecondaryText}>Connexion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)' },
  logoWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  logoWord: {
    color: colors.white,
    fontSize: 60,
    fontFamily: 'KaushanScript_400Regular',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  logoSub: {
    color: '#d3d9e0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: -10,
    transform: [{ translateX: -24 }],
  },
  textWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 400,
  },
  slideText: {
    color: colors.white,
    fontSize: 21,
    fontFamily: 'Quicksand_700Bold',
    lineHeight: 29,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: colors.orange },
  btnPrimary: {
    height: 54,
    borderRadius: 10,
    backgroundColor: '#7d7d7d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  btnSecondary: {
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: { color: colors.gray, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.9 },
});
