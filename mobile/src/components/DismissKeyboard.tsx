import { ReactNode } from 'react';
import { Keyboard, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

/**
 * Enveloppe un écran : taper en dehors d'un champ de saisie masque le clavier.
 * N'interfère pas avec le défilement (ScrollView) ni les boutons.
 */
export function DismissKeyboard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
