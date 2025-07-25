import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data storage (In a real app, this would be replaced with a backend/database)
let users = [
  { id: 1, email: 'customer@test.com', password: '123456', type: 'customer', name: 'Terish Babu' },
  { id: 2, email: 'employee@test.com', password: '123456', type: 'employee', name: 'VasanthaKumar' },
];

let products = [
  { id: 1, name: 'Laptop Pro X1', customerId: 1, purchaseDate: '2024-01-15' },
  { id: 2, name: 'Smartphone Z10', customerId: 1, purchaseDate: '2024-02-20' },
  { id: 3, name: 'Wireless Headphones', customerId: 1, purchaseDate: '2024-03-10' },
];

let complaints = [
  {
    id: 1,
    customerId: 1,
    productId: 1,
    productName: 'Laptop Pro X1',
    description: 'Screen flickering issue',
    status: 'New',
    reportedDate: '2024-07-20',
    assignedTo: null,
  },
  {
    id: 2,
    customerId: 1,
    productId: 2,
    productName: 'Smartphone Z10',
    description: 'Battery draining too fast',
    status: 'Assigned',
    reportedDate: '2024-07-18',
    assignedTo: 2,
  },
];

let nextId = { user: 3, product: 4, complaint: 3 };

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loginType, setLoginType] = useState('customer');
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Eye Icon Component for Password Visibility
  const EyeIcon = ({ visible, onPress }) => (
    <TouchableOpacity style={styles.eyeIcon} onPress={onPress}>
      <Text style={styles.eyeIconText}>{visible ? '👁️' : '👁️‍🗨️'}</Text>
    </TouchableOpacity>
  );

  // Authentication Component
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Input validation functions
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePassword = (password) => {
      return password.length >= 6;
    };

    const validateName = (name) => {
      return name.trim().length >= 2;
    };

    const clearForm = () => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    };

    const handleAuth = async () => {
      // Prevent multiple submissions
      if (loading) return;
      setLoading(true);

      try {
        // Trim whitespace from inputs
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const trimmedPassword = password.trim();

        if (isRegister) {
          // Registration validation
          if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
          }

          if (!validateName(trimmedName)) {
            Alert.alert('Error', 'Name must be at least 2 characters long');
            return;
          }

          if (!validateEmail(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
          }

          if (!validatePassword(trimmedPassword)) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
          }

          if (trimmedPassword !== confirmPassword.trim()) {
            Alert.alert('Error', 'Passwords do not match');
            return;
          }

          // Check if email already exists
          const existingUser = users.find(u => u.email === trimmedEmail && u.type === loginType);
          if (existingUser) {
            Alert.alert('Error', 'An account with this email already exists');
            return;
          }

          // Create new user
          const newUser = {
            id: nextId.user++,
            email: trimmedEmail,
            password: trimmedPassword,
            name: trimmedName,
            type: loginType,
          };
          
          users.push(newUser);
          
          Alert.alert(
            'Success', 
            'Registration successful! Please sign in with your new account.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsRegister(false);
                  clearForm();
                }
              }
            ]
          );
        } else {
          // Login validation
          if (!trimmedEmail || !trimmedPassword) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
          }

          if (!validateEmail(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
          }

          // Find user
          const user = users.find(u => 
            u.email === trimmedEmail && 
            u.password === trimmedPassword && 
            u.type === loginType
          );

          if (user) {
            setCurrentUser(user);
            setCurrentScreen(loginType === 'customer' ? 'customerDashboard' : 'employeeDashboard');
            clearForm();
          } else {
            Alert.alert(
              'Error', 
              `Invalid credentials. Please check your email, password, and make sure you're logging in as the correct user type (${loginType}).`
            );
          }
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    const toggleAuthMode = () => {
      setIsRegister(!isRegister);
      clearForm();
    };

    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        
        {/* Header with Gradient Effect */}
        <View style={styles.loginHeader}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>📝</Text>
          </View>
          <Text style={styles.appTitle}>Complaint Manager</Text>
          <Text style={styles.appSubtitle}>Streamline Your Support Experience</Text>
        </View>

        <ScrollView style={styles.loginContent} showsVerticalScrollIndicator={false}>
          {/* Login Type Selector */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>Login as:</Text>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, loginType === 'customer' && styles.activeTab]}
                onPress={() => {
                  setLoginType('customer');
                  clearForm();
                }}
              >
                <Text style={styles.tabIcon}>👤</Text>
                <Text style={[styles.tabText, loginType === 'customer' && styles.activeTabText]}>
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, loginType === 'employee' && styles.activeTab]}
                onPress={() => {
                  setLoginType('employee');
                  clearForm();
                }}
              >
                <Text style={styles.tabIcon}>👨‍💼</Text>
                <Text style={[styles.tabText, loginType === 'employee' && styles.activeTabText]}>
                  Employee
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isRegister 
                ? `Sign up as ${loginType}` 
                : `Sign in to your ${loginType} account`
              }
            </Text>

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={[styles.input, !validateName(name) && name.length > 0 && styles.inputError]}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {!validateName(name) && name.length > 0 && (
                  <Text style={styles.errorText}>Name must be at least 2 characters long</Text>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.input, !validateEmail(email) && email.length > 0 && styles.inputError]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
              />
              {!validateEmail(email) && email.length > 0 && (
                <Text style={styles.errorText}>Please enter a valid email address</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={[styles.passwordContainer, !validatePassword(password) && password.length > 0 && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  placeholderTextColor="#9CA3AF"
                />
                <EyeIcon 
                  visible={showPassword} 
                  onPress={() => setShowPassword(!showPassword)} 
                />
              </View>
              {!validatePassword(password) && password.length > 0 && (
                <Text style={styles.errorText}>Password must be at least 6 characters long</Text>
              )}
            </View>

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={[styles.passwordContainer, confirmPassword.length > 0 && password !== confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <EyeIcon 
                    visible={showConfirmPassword} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  />
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]} 
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              </Text>
            </TouchableOpacity>

            {loginType === 'customer' && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={toggleAuthMode}
                disabled={loading}
              >
                <Text style={styles.linkText}>
                  {isRegister 
                    ? 'Already have an account? Sign In' 
                    : 'Don\'t have an account? Sign Up'
                  }
                </Text>
              </TouchableOpacity>
            )}

            {/* Demo Credentials */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Customer: customer@test.com / 123456</Text>
              <Text style={styles.demoText}>Employee: employee@test.com / 123456</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Customer Dashboard
  const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [complaintForm, setComplaintForm] = useState({
      productId: '',
      description: '',
    });

    const customerProducts = products.filter(p => p.customerId === currentUser.id);
    const customerComplaints = complaints.filter(c => c.customerId === currentUser.id);

    const submitComplaint = () => {
      if (!complaintForm.productId || !complaintForm.description.trim()) {
        Alert.alert('Error', 'Please select a product and describe the issue');
        return;
      }

      const product = products.find(p => p.id === parseInt(complaintForm.productId));
      if (!product) {
        Alert.alert('Error', 'Selected product not found');
        return;
      }

      const newComplaint = {
        id: nextId.complaint++,
        customerId: currentUser.id,
        productId: parseInt(complaintForm.productId),
        productName: product.name,
        description: complaintForm.description.trim(),
        status: 'New',
        reportedDate: new Date().toISOString().split('T')[0],
        assignedTo: null,
      };

      complaints.push(newComplaint);
      setComplaintForm({ productId: '', description: '' });
      Alert.alert('Success', 'Complaint submitted successfully!');
      setActiveTab('track'); // Switch to track tab to show the new complaint
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'New': return '#EF4444';
        case 'Assigned': return '#F59E0B';
        case 'In Progress': return '#3B82F6';
        case 'Closed': return '#10B981';
        default: return '#6B7280';
      }
    };

    const getStatusEmoji = (status) => {
      switch (status) {
        case 'New': return '🆕';
        case 'Assigned': return '📋';
        case 'In Progress': return '⚡';
        case 'Closed': return '✅';
        default: return '📄';
      }
    };

    return (
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    onPress: () => {
                      setCurrentUser(null);
                      setCurrentScreen('login');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Tab Bar */}
        <View style={styles.enhancedTabContainer}>
          <TouchableOpacity
            style={[styles.enhancedTab, activeTab === 'products' && styles.activeEnhancedTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={styles.tabEmoji}>📦</Text>
            <Text style={[styles.enhancedTabText, activeTab === 'products' && styles.activeEnhancedTabText]}>
              Products
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.enhancedTab, activeTab === 'complaint' && styles.activeEnhancedTab]}
            onPress={() => setActiveTab('complaint')}
          >
            <Text style={styles.tabEmoji}>➕</Text>
            <Text style={[styles.enhancedTabText, activeTab === 'complaint' && styles.activeEnhancedTabText]}>
              New Issue
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.enhancedTab, activeTab === 'track' && styles.activeEnhancedTab]}
            onPress={() => setActiveTab('track')}
          >
            <Text style={styles.tabEmoji}>📊</Text>
            <Text style={[styles.enhancedTabText, activeTab === 'track' && styles.activeEnhancedTabText]}>
              Track ({customerComplaints.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'products' && (
            <View>
              <Text style={styles.sectionTitle}>Your Products</Text>
              {customerProducts.length > 0 ? (
                customerProducts.map(product => (
                  <View key={product.id} style={styles.enhancedCard}>
                    <View style={styles.productIcon}>
                      <Text style={styles.productEmoji}>📱</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{product.name}</Text>
                      <Text style={styles.cardSubtitle}>Purchased: {product.purchaseDate}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No products found</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'complaint' && (
            <View>
              <Text style={styles.sectionTitle}>Report New Issue</Text>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Select Product:</Text>
                <View style={styles.pickerContainer}>
                  {customerProducts.length > 0 ? (
                    customerProducts.map(product => (
                      <TouchableOpacity
                        key={product.id}
                        style={[
                          styles.pickerOption,
                          complaintForm.productId === product.id.toString() && styles.selectedOption
                        ]}
                        onPress={() => setComplaintForm({...complaintForm, productId: product.id.toString()})}
                      >
                        <Text style={styles.pickerEmoji}>📱</Text>
                        <Text style={styles.pickerText}>{product.name}</Text>
                        {complaintForm.productId === product.id.toString() && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noProductsText}>No products available. Please purchase a product first.</Text>
                  )}
                </View>

                <Text style={styles.label}>Issue Description:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the issue you're experiencing..."
                  value={complaintForm.description}
                  onChangeText={(text) => setComplaintForm({...complaintForm, description: text})}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity 
                  style={[styles.primaryButton, (!complaintForm.productId || !complaintForm.description.trim()) && styles.disabledButton]} 
                  onPress={submitComplaint}
                  disabled={!complaintForm.productId || !complaintForm.description.trim()}
                >
                  <Text style={styles.buttonText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'track' && (
            <View>
              <Text style={styles.sectionTitle}>Your Complaints</Text>
              {customerComplaints.length > 0 ? (
                customerComplaints.map(complaint => (
                  <View key={complaint.id} style={styles.enhancedCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.complaintIdSection}>
                        <Text style={styles.complaintId}>#{complaint.id}</Text>
                        <Text style={styles.cardTitle}>{complaint.productName}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                        <Text style={styles.statusEmoji}>{getStatusEmoji(complaint.status)}</Text>
                        <Text style={styles.statusText}>{complaint.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDescription}>{complaint.description}</Text>
                    <Text style={styles.cardDate}>📅 Reported: {complaint.reportedDate}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No complaints submitted yet</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Employee Dashboard (Enhanced similarly)
  const EmployeeDashboard = () => {
    const [activeTab, setActiveTab] = useState('assigned');

    const assignedComplaints = complaints.filter(c => c.assignedTo === currentUser.id);
    const unassignedComplaints = complaints.filter(c => !c.assignedTo);

    const assignComplaint = (complaintId) => {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        complaint.assignedTo = currentUser.id;
        complaint.status = 'Assigned';
        Alert.alert('Success', 'Complaint assigned successfully!');
      }
    };

    const updateStatus = (complaintId, newStatus) => {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        complaint.status = newStatus;
        Alert.alert('Success', 'Status updated successfully!');
        setModalVisible(false);
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'New': return '#EF4444';
        case 'Assigned': return '#F59E0B';
        case 'In Progress': return '#3B82F6';
        case 'Closed': return '#10B981';
        default: return '#6B7280';
      }
    };

    const getStatusEmoji = (status) => {
      switch (status) {
        case 'New': return '🆕';
        case 'Assigned': return '📋';
        case 'In Progress': return '⚡';
        case 'Closed': return '✅';
        default: return '📄';
      }
    };

    const showComplaintDetails = (complaint) => {
      setSelectedComplaint(complaint);
      setModalVisible(true);
    };

    return (
      <View style={styles.container}>
        {/* Enhanced Employee Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.welcomeText}>Employee Dashboard</Text>
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    onPress: () => {
                      setCurrentUser(null);
                      setCurrentScreen('login');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Employee Tabs */}
        <View style={styles.enhancedTabContainer}>
          <TouchableOpacity
            style={[styles.enhancedTab, activeTab === 'assigned' && styles.activeEnhancedTab]}
            onPress={() => setActiveTab('assigned')}
          >
            <Text style={styles.tabEmoji}>📋</Text>
            <Text style={[styles.enhancedTabText, activeTab === 'assigned' && styles.activeEnhancedTabText]}>
              Assigned ({assignedComplaints.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.enhancedTab, activeTab === 'unassigned' && styles.activeEnhancedTab]}
            onPress={() => setActiveTab('unassigned')}
          >
            <Text style={styles.tabEmoji}>📥</Text>
            <Text style={[styles.enhancedTabText, activeTab === 'unassigned' && styles.activeEnhancedTabText]}>
              Available ({unassignedComplaints.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'assigned' && (
            <View>
              <Text style={styles.sectionTitle}>Your Assigned Tasks</Text>
              {assignedComplaints.length > 0 ? (
                assignedComplaints.map(complaint => (
                  <TouchableOpacity
                    key={complaint.id}
                    style={styles.enhancedCard}
                    onPress={() => showComplaintDetails(complaint)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.complaintIdSection}>
                        <Text style={styles.complaintId}>#{complaint.id}</Text>
                        <Text style={styles.cardTitle}>{complaint.productName}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                        <Text style={styles.statusEmoji}>{getStatusEmoji(complaint.status)}</Text>
                        <Text style={styles.statusText}>{complaint.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDescription}>{complaint.description}</Text>
                    <Text style={styles.cardDate}>📅 Reported: {complaint.reportedDate}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No tasks assigned yet</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'unassigned' && (
            <View>
              <Text style={styles.sectionTitle}>Available Tasks</Text>
              {unassignedComplaints.length > 0 ? (
                unassignedComplaints.map(complaint => (
                  <View key={complaint.id} style={styles.enhancedCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.complaintIdSection}>
                        <Text style={styles.complaintId}>#{complaint.id}</Text>
                        <Text style={styles.cardTitle}>{complaint.productName}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                        <Text style={styles.statusEmoji}>{getStatusEmoji(complaint.status)}</Text>
                        <Text style={styles.statusText}>{complaint.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDescription}>{complaint.description}</Text>
                    <Text style={styles.cardDate}>📅 Reported: {complaint.reportedDate}</Text>
                    
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => assignComplaint(complaint.id)}
                    >
                      <Text style={styles.buttonText}>Take This Task</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No available tasks</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Enhanced Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.enhancedModalContent}>
              {selectedComplaint && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Complaint Details</Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.modalDetailLabel}>Complaint ID:</Text>
                    <Text style={styles.modalDetailValue}>#{selectedComplaint.id}</Text>
                  </View>
                  
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.modalDetailLabel}>Product:</Text>
                    <Text style={styles.modalDetailValue}>{selectedComplaint.productName}</Text>
                  </View>
                  
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.modalDetailLabel}>Description:</Text>
                    <Text style={styles.modalDetailValue}>{selectedComplaint.description}</Text>
                  </View>
                  
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.modalDetailLabel}>Reported Date:</Text>
                    <Text style={styles.modalDetailValue}>{selectedComplaint.reportedDate}</Text>
                  </View>
                  
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.modalDetailLabel}>Current Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedComplaint.status) }]}>
                      <Text style={styles.statusEmoji}>{getStatusEmoji(selectedComplaint.status)}</Text>
                      <Text style={styles.statusText}>{selectedComplaint.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.modalSubtitle}>Update Status:</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#3B82F6' }]}
                      onPress={() => updateStatus(selectedComplaint.id, 'In Progress')}
                    >
                      <Text style={styles.statusButtonEmoji}>⚡</Text>
                      <Text style={styles.buttonText}>In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#10B981' }]}
                      onPress={() => updateStatus(selectedComplaint.id, 'Closed')}
                    >
                      <Text style={styles.statusButtonEmoji}>✅</Text>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'customerDashboard':
        return <CustomerDashboard />;
      case 'employeeDashboard':
        return <EmployeeDashboard />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Enhanced Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  loginHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loginContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  userTypeContainer: {
    marginBottom: 30,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#374151',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 12,
  },
  eyeIconText: {
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '500',
  },
  demoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  // Enhanced Dashboard Styles
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },

  // Enhanced Tab Styles
  enhancedTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  enhancedTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
  },
  activeEnhancedTab: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  enhancedTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeEnhancedTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },

  // Enhanced Card Styles
  enhancedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  productIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 20,
  },
  cardContent: {
    paddingRight: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintIdSection: {
    flex: 1,
  },
  complaintId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  statusEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Form Styles
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedOption: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
  },
  pickerEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  noProductsText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Button Styles
  assignButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  enhancedModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalDetailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonEmoji: {
    fontSize: 14,
    marginRight: 6,
    color: '#FFFFFF',
  },
});

export default App;