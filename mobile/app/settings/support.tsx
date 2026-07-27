import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors, font, spacing } from '../../src/theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const FAQS = [
  { question: 'Comment configurer mes QR Codes Wave et Orange Money ?', answer: 'Allez dans Paramètres > Configuration et entrez vos numéros Wave et Orange Money. Enregistrez et vos QR Codes seront générés automatiquement.' },
  { question: 'Comment fonctionne le paiement Téranga ?', answer: 'Le client scanne votre QR Code et valide le montant. Vous recevez l\'argent instantanément sur votre compte marchand.' },
  { question: 'Quels sont les méthodes de paiement supportées ?', answer: 'Nous supportons actuellement Wave et Orange Money. D\'autres méthodes seront bientôt ajoutées.' },
];

export default function SupportScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Contact Tiles */}
      <View style={styles.contactRow}>
        <Pressable 
          style={styles.contactTile} 
          onPress={() => Linking.openURL('whatsapp://send?phone=221770000000')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#E4F0FC' }]}>
            <FontAwesome5 name="whatsapp" size={28} color={colors.blue} />
          </View>
          <Text style={styles.tileText}>Envoyer un message</Text>
        </Pressable>

        <Pressable 
          style={styles.contactTile} 
          onPress={() => Linking.openURL('tel:+221770000000')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FFF0E5' }]}>
            <Ionicons name="call-outline" size={28} color={colors.orange} />
          </View>
          <Text style={styles.tileText}>Appeler le service client</Text>
        </Pressable>
      </View>

      {/* FAQ Section */}
      <Text style={styles.faqTitle}>Questions fréquentes</Text>
      <View style={styles.faqList}>
        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <Pressable key={index} style={styles.faqCard} onPress={() => toggleFAQ(index)}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <View style={[styles.chevronBox, isExpanded && styles.chevronBoxActive]}>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={isExpanded ? colors.white : colors.blue} />
                </View>
              </View>
              {isExpanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.xl },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xl * 1.5 },
  contactTile: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tileText: { fontSize: font.md, fontWeight: '700', color: colors.blue, textAlign: 'center' },
  faqTitle: { fontSize: 22, fontWeight: '800', color: '#1A3B5C', marginBottom: spacing.lg },
  faqList: { paddingBottom: spacing.xl },
  faqCard: {
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#Eef1f6',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: font.md, fontWeight: '700', color: '#3A4D6B', paddingRight: spacing.sm, lineHeight: 22 },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E4F0FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBoxActive: { backgroundColor: colors.blue },
  faqAnswer: { marginTop: spacing.md, fontSize: font.sm, color: colors.textMuted, lineHeight: 20 },
});
