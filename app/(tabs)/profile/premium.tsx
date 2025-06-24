import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Gem, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Cloud, 
  Smartphone,
  Check,
  Crown,
  Zap,
  Shield
} from 'lucide-react-native';
import { router } from 'expo-router';

interface PremiumFeature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

export default function PremiumScreen() {
  const premiumFeatures: PremiumFeature[] = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights into your habits, goals, and productivity patterns with beautiful charts and trends.',
      color: '#4F46E5',
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Sync your data across all devices and never lose your progress. Access your habits anywhere.',
      color: '#06B6D4',
    },
    {
      icon: Star,
      title: 'Unlimited Habits',
      description: 'Create as many habits as you want without any restrictions. Build comprehensive routines.',
      color: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'AI-powered recommendations to optimize your habits and achieve your goals faster.',
      color: '#10B981',
    },
    {
      icon: Smartphone,
      title: 'Widget Support',
      description: 'Quick access to your habits directly from your home screen with beautiful widgets.',
      color: '#8B5CF6',
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster response times and priority assistance from our support team.',
      color: '#EF4444',
    },
  ];

  const handleUpgrade = () => {
    Alert.alert(
      'Premium Upgrade',
      'To implement in-app purchases, you\'ll need to:\n\n1. Set up RevenueCat for subscription management\n2. Configure App Store Connect / Google Play Console\n3. Export your project locally to install the RevenueCat SDK\n4. Create a development build with Expo Dev Client\n\nRevenueCat is the recommended solution for mobile subscriptions as it handles billing, entitlements, and analytics.',
      [
        { text: 'Learn More', onPress: () => console.log('Open RevenueCat docs') },
        { text: 'OK' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Premium Features</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Crown size={32} color="#F59E0B" strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Get access to powerful features that will supercharge your productivity and help you achieve your goals faster.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          {premiumFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <IconComponent size={24} color={feature.color} strokeWidth={2} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={styles.featureCheck}>
                  <Check size={16} color="#10B981" strokeWidth={2.5} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Monthly Plan */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Monthly</Text>
              <View style={styles.pricingBadge}>
                <Text style={styles.pricingBadgeText}>Most Flexible</Text>
              </View>
            </View>
            <View style={styles.pricingPrice}>
              <Text style={styles.priceAmount}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Perfect for trying out premium features
            </Text>
          </View>

          {/* Yearly Plan */}
          <View style={[styles.pricingCard, styles.recommendedCard]}>
            <View style={styles.recommendedBanner}>
              <Zap size={14} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.recommendedText}>BEST VALUE</Text>
            </View>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Yearly</Text>
              <View style={[styles.pricingBadge, styles.savingsBadge]}>
                <Text style={styles.savingsBadgeText}>Save 50%</Text>
              </View>
            </View>
            <View style={styles.pricingPrice}>
              <Text style={styles.priceAmount}>$29.99</Text>
              <Text style={styles.pricePeriod}>/year</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Just $2.50/month when billed annually
            </Text>
          </View>
        </View>

        {/* Benefits Summary */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Check size={16} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.benefitText}>7-day free trial</Text>
            </View>
            <View style={styles.benefitItem}>
              <Check size={16} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.benefitText}>Cancel anytime</Text>
            </View>
            <View style={styles.benefitItem}>
              <Check size={16} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.benefitText}>All future updates included</Text>
            </View>
            <View style={styles.benefitItem}>
              <Check size={16} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          activeOpacity={0.8}
        >
          <Gem size={18} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscription automatically renews unless cancelled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 20,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  recommendedBanner: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    backgroundColor: '#4F46E5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  recommendedText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  pricingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  pricingBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pricingBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
  },
  savingsBadgeText: {
    color: '#10B981',
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  pricePeriod: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});