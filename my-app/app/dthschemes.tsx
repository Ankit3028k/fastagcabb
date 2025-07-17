import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SchemesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView >
      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Schemes</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            {/* <Ionicons name="briefcase" size={40} color={colors.primary} /> */}
             <Image
                            source={require('../assets/images/dth.jpg')}
                            style={styles.schemeImage}
                          />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Schemes</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Discover various schemes and programs available to maximize your benefits and rewards.
          </Text>
        </View>
        
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
         <Text style={[styles.sectionTitle, { color: colors.primary }]}>Wire Size (90 Meters) Points Earned</Text>
                  <View style={styles.table}>
                    {[
                      ['0.75 mm', '5 Points'],
                      ['1.0 mm', '5 Points'],
                      ['1.5 mm', '10 Points'],
                      ['2.5 mm', '15 Points'],
                      ['4.0 mm', '20 Points'],
                    //   ['6.0 mm', '60 Points'],
                    //   ['10.0 mm', '100 Points'],
                    ].map(([size, points], index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { color: colors.text }]}>{size}</Text>
                        <Text style={[styles.tableCell, { color: colors.textSecondary, textAlign: 'right' }]}>{points}</Text>
                      </View>
                    ))}
                  </View>
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },

  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
   schemeImage: {
    width: 80,
    height: 50,
    // marginBottom: 8,
  },
    sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginTop: -50,
    marginBottom: 20,
  },
    tableCell: {
    flex: 1,
    fontSize: 14,
  },
   table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
   tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
