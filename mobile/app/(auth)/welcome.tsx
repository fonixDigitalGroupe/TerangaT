import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, spacing } from '../../src/theme';

const SLIDES = [
  {
    img: require('../../assets/hero-market.jpg'),
    title: 'Bienvenue sur Téranga Transfert !',
    text: 'Envoyez et recevez de l’argent en toute simplicité, partout au Sénégal.',
  },
  {
    img: require('../../assets/hero-agent.png'),
    title: 'Wave & Orange Money réunis',
    text: 'Gérez tous vos transferts Wave et Orange Money depuis une seule application.',
  },
  {
    img: require('../../assets/hero-2.jpg'),
    title: 'Rapide, sûr et fiable',
    text: 'Dépôts, retraits et transferts en quelques secondes, suivis en temps réel.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        listRef.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [width]);

  const circle = Math.min(width * 0.72, 290);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Logo façon "ting business" : marque colorée + descriptif gris */}
      <View style={styles.logoWrap}>
        <Text style={styles.logoBrand}>
          téran<Text style={{ color: colors.orange }}>g</Text>a
        </Text>
        <Text style={styles.logoDesc}>TRANSFERT</Text>
      </View>

      {/* Carrousel (remplit l'espace central) */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={item.img}
              style={{ width: circle, height: circle, borderRadius: circle / 2, marginBottom: spacing.xl }}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.text}</Text>
          </View>
        )}
      />

      {/* Pagination */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Boutons */}
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnConnexion, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnText}>Connexion</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnInscription, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.btnText}>Inscription</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoBrand: {
    fontSize: 34,
    color: colors.blue,
    fontFamily: 'Quicksand_700Bold',
    letterSpacing: -0.3,
  },
  logoDesc: { fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 5, marginLeft: -5, marginTop: 1 },
  list: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingBottom: 56 },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: colors.blue,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  desc: { fontSize: font.md, color: '#8e99a8', textAlign: 'center', lineHeight: 24, fontWeight: '400' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d3d8e0' },
  dotActive: { width: 22, backgroundColor: colors.blue },
  buttons: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: 38, paddingBottom: spacing.md },
  btn: {
    flex: 1,
    height: 58,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // ombre douce pour "faire fondre" les boutons
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  btnConnexion: { backgroundColor: colors.orange, shadowColor: colors.orange },
  btnInscription: { backgroundColor: colors.blue, shadowColor: colors.blue },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
