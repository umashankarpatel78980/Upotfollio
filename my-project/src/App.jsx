import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, LogOut, X, Edit2, Trash2, Eye, Search, Mail, Calendar, TrendingUp, Users } from 'lucide-react';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/contact'
});

const AdminAPI = axios.create({
  baseURL: 'http://localhost:5000/api/admin'
});

export default function ContactManagementApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', message: '' });
  const [replyMessage, setReplyMessage] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isLoggedIn) fetchContacts();
  }, [isLoggedIn]);

  const fetchContacts = async () => {
    try {
      const res = await API.get('/all');
      setContacts(Array.isArray(res.data) ? res.data : res.data.data);
    } catch (err) {
      console.error(err);
      setContacts([]);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Hardcoded credentials (no backend required)
    const HARDCODED_EMAIL = "umashankarpatel78980@gmail.com";
    const HARDCODED_PASSWORD = "Uma@123";

    // Validate credentials locally
    if (username === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid credentials! Please check your username and password.');
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      total: contacts.length,
      today: contacts.filter(c => c.date && c.date.split('T')[0] === today).length,
      week: contacts.filter(c => c.date && c.date.split('T')[0] >= thisWeek).length,
      month: contacts.filter(c => c.date && c.date.split('T')[0] >= thisMonth).length
    };
  };

  const viewDetails = async (contact) => {
    try {
      const res = await API.get(`/${contact._id}`);
      setSelectedContact(res.data.data || res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  const editContact = (contact) => {
    setSelectedContact(contact);
    setEditForm({
      name: contact.name,
      email: contact.email,
      message: contact.message
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    try {
      await API.put(`/${selectedContact._id}`, editForm);
      setContacts(
        contacts.map(c =>
          c._id === selectedContact._id ? { ...c, ...editForm } : c
        )
      );
      setShowEdit(false);
      setReplyMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to update contact!');
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message!');
      return;
    }
    try {
      // show a simple loading indicator
      const res = await API.post(`/reply/${selectedContact._id}`, { message: replyMessage });
      if (res.data && res.data.success) {
        alert('Reply sent successfully to ' + selectedContact.email);
        setReplyMessage('');
      } else {
        const errMsg = res.data?.message || 'Failed to send reply';
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to send reply email!';
      alert(serverMsg);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await API.delete(`/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Message', 'Date'],
      ...contacts.map(c => [c.name, c.email, c.message, c.date])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
  };

  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const stats = getStats();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Mail className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-gray-600 mt-2">Contact Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
            {loginError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{loginError}</p>
              </div>
            )}
          </form>
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-center text-sm text-indigo-600 font-medium">
              Use your registered admin credentials
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Contact Management</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Today</p>
                <p className="text-3xl font-bold text-gray-800">{stats.today}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-800">{stats.week}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-800">{stats.month}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Mail className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search contacts by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.message?.substring(0, 40)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.date ? new Date(contact.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editContact(contact)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Edit Contact"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteContact(contact._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete Contact"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Mail className="mx-auto mb-3 text-gray-300" size={48} />
                      <p className="text-lg font-medium">No contacts found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="text-indigo-600" size={24} />
                Contact Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                <p className="text-base font-semibold text-gray-900">{selectedContact.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                <p className="text-base font-semibold text-gray-900">{selectedContact.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                <p className="text-base text-gray-900">{selectedContact.message}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedContact.date ? new Date(selectedContact.date).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 animate-fadeIn my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Edit2 className="text-indigo-600" size={24} />
                Edit Contact
              </h2>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                />
              </div>

              {/* Reply Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 Send Reply Email
                </label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="Type your reply message to send via email..."
                />
                <button
                  onClick={sendReply}
                  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Send Reply Email
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
