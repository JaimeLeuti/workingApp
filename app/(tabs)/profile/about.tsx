import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { 
  ArrowLeft, 
  Info, 
  Heart, 
  ExternalLink, 
  Mail, 
  MessageCircle,
  Star,
  Github,
  Twitter,
  Globe
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@dofive.app').catch(err => console.error('Failed to open email:', err));
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
        
        <Text style={styles.headerTitle}>About DoFive</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIcon}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2' }}
              style={styles.appIconImage}
            />
          </View>
          <Text style={styles.appName}>DoFive</Text>
          <Text style={styles.appTagline}>Your Personal Productivity Companion</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>Latest</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.description}>
            DoFive is designed to help you build better habits, achieve your goals, and stay organized with your daily tasks. 
            Our mission is to make productivity simple, enjoyable, and sustainable for everyone.
          </Text>
          <Text style={styles.description}>
            Whether you're looking to develop new habits, track your progress, or manage your daily workflow, 
            DoFive provides the tools you need to succeed.
          </Text>
        </View>

        {/* Features Highlight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Star size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Habit tracking with streaks and analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Goal setting and progress monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Task management with drag-and-drop</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Beautiful, intuitive interface</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.featureText}>Local data storage for privacy</Text>
            </View>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleEmailPress}
            activeOpacity={0.8}
          >
            <View style={styles.contactIcon}>
              <Mail size={18} color="#4F46E5" strokeWidth={2} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@dofive.app</Text>
            </View>
            <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('https://dofive.app/feedback')}
            activeOpacity={0.8}
          >
            <View style={styles.contactIcon}>
              <MessageCircle size={18} color="#10B981" strokeWidth={2} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Send Feedback</Text>
              <Text style={styles.contactSubtitle}>Help us improve the app</Text>
            </View>
            <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleLinkPress('https://twitter.com/dofiveapp')}
              activeOpacity={0.8}
            >
              <Twitter size={20} color="#1DA1F2" strokeWidth={2} />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleLinkPress('https://github.com/dofive')}
              activeOpacity={0.8}
            >
              <Github size={20} color="#333" strokeWidth={2} />
              <Text style={styles.socialButtonText}>GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleLinkPress('https://dofive.app')}
              activeOpacity={0.8}
            >
              <Globe size={20} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.socialButtonText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => handleLinkPress('https://dofive.app/terms')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalText}>Terms of Service</Text>
            <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => handleLinkPress('https://dofive.app/privacy')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalText}>Privacy Policy</Text>
            <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => handleLinkPress('https://dofive.app/licenses')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalText}>Open Source Licenses</Text>
            <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.creditsContainer}>
            <View style={styles.creditItem}>
              <Heart size={16} color="#EF4444" strokeWidth={2} />
              <Text style={styles.creditText}>
                Made with love by the DoFive team
              </Text>
            </View>
            <Text style={styles.creditSubtext}>
              Special thanks to all our beta testers and the open source community
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>
            © 2024 DoFive. All rights reserved.
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
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  versionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  versionBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  legalText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  creditsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  creditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  creditText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  creditSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});