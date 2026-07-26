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

  const circle = Math.min(width * 0.58, 230);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Logo façon "ting business" : marque colorée + descriptif gris */}
      <View style={styles.logoWrap}>
        <Text style={styles.logoBrand}>Téranga</Text>
        <Text style={styles.logoDesc}>transfert</Text>
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
            <View style={[styles.heroWrap, { width: circle + 50, height: circle + 46 }]}>
              <View
                style={[
                  styles.accentCircle,
                  { width: circle * 0.5, height: circle * 0.5, borderRadius: circle * 0.25 },
                ]}
              />
              <Image
                source={item.img}
                style={{ width: circle, height: circle, borderRadius: circle / 2, marginTop: 36 }}
              />
            </View>

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
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoBrand: { fontSize: 34, color: colors.blue, fontFamily: 'KaushanScript_400Regular' },
  logoDesc: { fontSize: 22, color: '#9aa7b8', fontWeight: '600', letterSpacing: 0.5 },
  list: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  heroWrap: { alignItems: 'center', justifyContent: 'flex-start', marginBottom: spacing.xl },
  accentCircle: { position: 'absolute', top: 0, right: 14, backgroundColor: colors.orange },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.blue,
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: spacing.sm,
  },
  desc: { fontSize: font.md, color: colors.textMuted, textAlign: 'center', lineHeight: 23 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d3d8e0' },
  dotActive: { width: 22, backgroundColor: colors.blue },
  buttons: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  btn: { flex: 1, height: 58, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  btnConnexion: { backgroundColor: colors.orange },
  btnInscription: { backgroundColor: colors.blue },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.9 },
});
