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
} from 'react-native';

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

let nextId = { user: 3, product: 4, complaint: 3 }

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loginType, setLoginType] = useState('customer');
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Authentication Component
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');

    const handleAuth = () => {
      if (isRegister) {
        // Registration
        if (!name || !email || !password) {
          Alert.alert('Error', 'Please fill all fields');
          return;
        }
        const newUser = {
          id: nextId.user++,
          email,
          password,
          name,
          type: loginType,
        };
        users.push(newUser);
        Alert.alert('Success', 'Registration successful! Please login.');
        setIsRegister(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        // Login
        const user = users.find(u => u.email === email && u.password === password && u.type === loginType);
        if (user) {
          setCurrentUser(user);
          setCurrentScreen(loginType === 'customer' ? 'customerDashboard' : 'employeeDashboard');
        } else {
          Alert.alert('Error', 'Invalid credentials');
        }
      }
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Complaint Management System</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginType === 'customer' && styles.activeTab]}
              onPress={() => setLoginType('customer')}
            >
              <Text style={[styles.tabText, loginType === 'customer' && styles.activeTabText]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginType === 'employee' && styles.activeTab]}
              onPress={() => setLoginType('employee')}
            >
              <Text style={[styles.tabText, loginType === 'employee' && styles.activeTabText]}>
                Employee
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {isRegister && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.buttonText}>
                {isRegister ? 'Register' : 'Login'}
              </Text>
            </TouchableOpacity>

            {loginType === 'customer' && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setIsRegister(!isRegister)}
              >
                <Text style={styles.linkText}>
                  {isRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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
      if (!complaintForm.productId || !complaintForm.description) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const product = products.find(p => p.id === parseInt(complaintForm.productId));
      const newComplaint = {
        id: nextId.complaint++,
        customerId: currentUser.id,
        productId: parseInt(complaintForm.productId),
        productName: product.name,
        description: complaintForm.description,
        status: 'New',
        reportedDate: new Date().toISOString().split('T')[0],
        assignedTo: null,
      };

      complaints.push(newComplaint);
      setComplaintForm({ productId: '', description: '' });
      Alert.alert('Success', 'Complaint submitted successfully!');
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'New': return '#FF6B6B';
        case 'Assigned': return '#4ECDC4';
        case 'In Progress': return '#45B7D1';
        case 'Closed': return '#96CEB4';
        default: return '#95A5A6';
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {currentUser.name}</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setCurrentUser(null);
              setCurrentScreen('login');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'complaint' && styles.activeTab]}
            onPress={() => setActiveTab('complaint')}
          >
            <Text style={[styles.tabText, activeTab === 'complaint' && styles.activeTabText]}>
              New Complaint
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'track' && styles.activeTab]}
            onPress={() => setActiveTab('track')}
          >
            <Text style={[styles.tabText, activeTab === 'track' && styles.activeTabText]}>
              Track Complaints
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'products' && (
            <View>
              <Text style={styles.sectionTitle}>Your Products</Text>
              {customerProducts.map(product => (
                <View key={product.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{product.name}</Text>
                  <Text style={styles.cardSubtitle}>Purchased: {product.purchaseDate}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'complaint' && (
            <View>
              <Text style={styles.sectionTitle}>Register New Complaint</Text>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Select Product:</Text>
                <View style={styles.pickerContainer}>
                  {customerProducts.map(product => (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.pickerOption,
                        complaintForm.productId === product.id.toString() && styles.selectedOption
                      ]}
                      onPress={() => setComplaintForm({...complaintForm, productId: product.id.toString()})}
                    >
                      <Text style={styles.pickerText}>{product.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Description:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your complaint..."
                  value={complaintForm.description}
                  onChangeText={(text) => setComplaintForm({...complaintForm, description: text})}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity style={styles.primaryButton} onPress={submitComplaint}>
                  <Text style={styles.buttonText}>Submit Complaint</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'track' && (
            <View>
              <Text style={styles.sectionTitle}>Your Complaints</Text>
              {customerComplaints.map(complaint => (
                <View key={complaint.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>#{complaint.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                      <Text style={styles.statusText}>{complaint.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{complaint.productName}</Text>
                  <Text style={styles.cardSubtitle}>{complaint.description}</Text>
                  <Text style={styles.cardDate}>Reported: {complaint.reportedDate}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Employee Dashboard
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
        case 'New': return '#FF6B6B';
        case 'Assigned': return '#4ECDC4';
        case 'In Progress': return '#45B7D1';
        case 'Closed': return '#96CEB4';
        default: return '#95A5A6';
      }
    };

    const showComplaintDetails = (complaint) => {
      setSelectedComplaint(complaint);
      setModalVisible(true);
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Employee Dashboard</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setCurrentUser(null);
              setCurrentScreen('login');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
            onPress={() => setActiveTab('assigned')}
          >
            <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
              Assigned ({assignedComplaints.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unassigned' && styles.activeTab]}
            onPress={() => setActiveTab('unassigned')}
          >
            <Text style={[styles.tabText, activeTab === 'unassigned' && styles.activeTabText]}>
              Unassigned ({unassignedComplaints.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'assigned' && (
            <View>
              <Text style={styles.sectionTitle}>Your Assigned Complaints</Text>
              {assignedComplaints.map(complaint => (
                <TouchableOpacity
                  key={complaint.id}
                  style={styles.card}
                  onPress={() => showComplaintDetails(complaint)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>#{complaint.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                      <Text style={styles.statusText}>{complaint.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{complaint.productName}</Text>
                  <Text style={styles.cardSubtitle}>{complaint.description}</Text>
                  <Text style={styles.cardDate}>Reported: {complaint.reportedDate}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'unassigned' && (
            <View>
              <Text style={styles.sectionTitle}>Unassigned Complaints</Text>
              {unassignedComplaints.map(complaint => (
                <View key={complaint.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>#{complaint.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                      <Text style={styles.statusText}>{complaint.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{complaint.productName}</Text>
                  <Text style={styles.cardSubtitle}>{complaint.description}</Text>
                  <Text style={styles.cardDate}>Reported: {complaint.reportedDate}</Text>
                  
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => assignComplaint(complaint.id)}
                  >
                    <Text style={styles.buttonText}>Assign to Me</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Complaint Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedComplaint && (
                <>
                  <Text style={styles.modalTitle}>Complaint Details</Text>
                  <Text style={styles.modalText}>ID: #{selectedComplaint.id}</Text>
                  <Text style={styles.modalText}>Product: {selectedComplaint.productName}</Text>
                  <Text style={styles.modalText}>Description: {selectedComplaint.description}</Text>
                  <Text style={styles.modalText}>Reported: {selectedComplaint.reportedDate}</Text>
                  <Text style={styles.modalText}>Current Status: {selectedComplaint.status}</Text>

                  <Text style={styles.modalSubtitle}>Update Status:</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#45B7D1' }]}
                      onPress={() => updateStatus(selectedComplaint.id, 'In Progress')}
                    >
                      <Text style={styles.buttonText}>In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#96CEB4' }]}
                      onPress={() => updateStatus(selectedComplaint.id, 'Closed')}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  pickerText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  assignButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardContent: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#2c3e50',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default App;