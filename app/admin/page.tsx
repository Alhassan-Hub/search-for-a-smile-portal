"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase"; 
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Lock, Users, Phone, Mail, MapPin, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "smile2024") {
      setIsAuthenticated(true);
      fetchApplications();
    } else {
      alert("Incorrect passcode");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "applications"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const appsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: DELETE FUNCTION
  const handleDelete = async (id: string) => {
    // 1. Ask for confirmation first
    if (!window.confirm("Are you sure you want to permanently delete this application?")) return;
    
    try {
      // 2. Delete it from Firebase
      await deleteDoc(doc(db, "applications", id));
      
      // 3. Remove it from the screen instantly without refreshing the page
      setApplications((prevApps) => prevApps.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete. Check your connection.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-green-500/30 text-center max-w-sm w-full">
          <Lock className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Passcode" className="w-full px-4 py-3 bg-black border border-green-500/50 rounded-xl text-white mb-4 text-center tracking-widest" />
          <button type="submit" className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors">Enter Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-green-500/20">
          <div>
            <h1 className="text-3xl font-black text-green-400 flex items-center gap-3"><Users size={32} /> Applicant Dashboard</h1>
            <p className="text-gray-400 mt-2">Total Applications: {applications.length}</p>
          </div>
          <button onClick={fetchApplications} className="px-4 py-2 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors">Refresh Data</button>
        </div>

        {loading ? (
          <div className="text-center text-green-400 py-20 animate-pulse">Loading database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-black/40 backdrop-blur-md border border-gray-800 hover:border-green-500/50 p-6 rounded-2xl transition-colors relative group">
                
                {/* NEW: DELETE BUTTON (Trash Icon) */}
                <button 
                  onClick={() => handleDelete(app.id)} 
                  className="absolute top-4 right-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                  title="Delete Application"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <h2 className="text-xl font-bold text-white truncate">{app.fullName}</h2>
                </div>
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block ${app.membershipType === 'volunteer' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                  {/* Checks for new data, falls back to old data, or defaults to member */}
                  {app.membershipType === 'volunteer' || app.role === 'volunteer' ? 'Volunteer' : 'General Member'}
                </span>
                <div className="space-y-3 text-sm text-gray-300 mt-2">
                  <p className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /> {app.phone}</p>
                  <p className="flex items-center gap-2 truncate"><Mail size={16} className="text-gray-500" /> {app.email}</p>
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-500" /> {app.city}, {app.country}</p>
                  
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <div className="mb-4">
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Core Skills</span>
                      <p className="text-green-400 font-medium text-sm mt-1 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        {app.skills || "No skills provided"}
                      </p>
                    </div>
                    <p><span className="text-gray-500">Source:</span> <span className="capitalize">{app.source}</span></p>
                    <p className="text-xs text-gray-600 mt-2">
                      Applied: {app.submittedAt ? new Date(app.submittedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}