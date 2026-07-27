import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { colors, font, spacing } from '../../src/theme';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.heroTitle}>CGU</Text>
        
        <Text style={styles.mainTitle}>
          CONDITIONS GÉNÉRALES D'UTILISATION DE L'APPLICATION TÉRANGA BUSINESS
        </Text>

        <Text style={styles.paragraph}>
          Les présentes Conditions Générales d'Utilisation de l'Application "Téranga Business" sont conclues entre :
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>FONIX DIGITAL GROUPE (FDG)</Text>, société à responsabilité limitée de droit sénégalais, immatriculée au Registre du Commerce et du Crédit Mobilier sous le numéro SN DKR 2026 B 1234 et titulaire du NINEA numéro 123456789, dont le siège social est situé à Dakar, Sénégal, dûment représentée ;
        </Text>

        <Text style={styles.subtext}>Ci-après « FDG »</Text>

        <Text style={styles.boldTitle}>ET</Text>

        <Text style={styles.paragraph}>
          Toute personne physique ou morale souhaitant accéder à l'Application et à ses services.
        </Text>

        <Text style={styles.subtext}>Ci-après dénommé « l'Utilisateur » ou « Marchand ».</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>INFORMATIONS DE L'APPLICATION</Text>
        
        <Text style={styles.subsectionTitle}>Éditeur</Text>
        <Text style={styles.infoBlock}>
          <Text style={styles.boldText}>Fonix Digital Groupe</Text>{'\n'}
          <Text style={styles.boldText}>ADRESSE :</Text> Dakar, Sénégal{'\n'}
          <Text style={styles.boldText}>RCCM :</Text> SN DKR 2026 B 1234{'\n'}
          <Text style={styles.boldText}>NINEA :</Text> 123456789
        </Text>

        <Text style={styles.subsectionTitle}>Hébergement</Text>
        <Text style={styles.paragraph}>
          L'application est hébergée sur des serveurs sécurisés garantissant la protection et la disponibilité de vos données.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xl * 2 },
  heroTitle: { fontSize: 42, fontWeight: '800', color: colors.blue, marginBottom: spacing.lg },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#1A3B5C', lineHeight: 28, marginBottom: spacing.md },
  paragraph: { fontSize: font.sm, color: '#3A4D6B', lineHeight: 22, marginBottom: spacing.sm },
  boldText: { fontWeight: '700', color: '#1A3B5C' },
  subtext: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic' },
  boldTitle: { fontSize: font.md, fontWeight: '800', color: '#1A3B5C', marginVertical: spacing.sm },
  divider: { height: 4, backgroundColor: '#8A99AC', marginVertical: spacing.xl },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A3B5C', marginBottom: spacing.lg },
  subsectionTitle: { fontSize: font.lg, fontWeight: '700', color: '#1A3B5C', marginBottom: spacing.sm },
  infoBlock: { fontSize: font.sm, color: '#3A4D6B', lineHeight: 24, marginBottom: spacing.xl },
});
