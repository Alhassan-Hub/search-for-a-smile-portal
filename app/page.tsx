"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ArrowRight, Palette, Heart } from "lucide-react";

// FIREBASE IMPORTS
import { db } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // NEW: Tracks if submission worked
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  
  // THEME SHIFTING LOGIC
  const [colorIndex, setColorIndex] = useState(0);
  const [isShedding, setIsShedding] = useState(false);
  const THEMES = [0, 100, 275]; 
  const currentHue = THEMES[colorIndex];
  const nextHue = THEMES[(colorIndex + 1) % THEMES.length];

 const [formData, setFormData] = useState({
    fullName: "", dob: "", email: "", phone: "",
    address: "", city: "", state: "", country: "Sierra Leone",
    membershipType: "member", source: "", agreed: false,
    skills: "" // <--- NEW ADDITION
  });

// We just added HTMLTextAreaElement inside the angle brackets!
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // ACTUAL FIREBASE & EMAIL SUBMISSION LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) return;
    
    setIsSubmitting(true);

    try {
      // 1. Save to Firebase
      const applicationsRef = collection(db, "applications");
      await addDoc(applicationsRef, {
        ...formData,
        status: "pending", 
        submittedAt: serverTimestamp(), 
      });

      // 2. NEW: Trigger the Email
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // 3. Show the success screen
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Something went wrong. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const triggerShedding = () => {
    if (isShedding) return;
    setIsShedding(true);
  };

  return (
    <>
      <div 
        className="relative min-h-screen bg-black font-sans p-4 sm:p-8 overflow-hidden transition-all duration-[1500ms]"
        style={{ filter: `hue-rotate(${currentHue}deg)` }}
      >
        {/* SHEDDING SKIN ANIMATION */}
        <AnimatePresence>
          {isShedding && (
            <motion.div
              initial={{ clipPath: "circle(0% at 0% 0%)" }}
              animate={{ clipPath: "circle(200% at 0% 0%)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.75, 0, 0.25, 1] }}
              onAnimationComplete={() => {
                setColorIndex((prev) => (prev + 1) % THEMES.length);
                setIsShedding(false);
              }}
              className="absolute inset-0 z-0 bg-black pointer-events-none"
              style={{ filter: `hue-rotate(${nextHue - currentHue}deg)` }}
            >
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-900/60 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-800/50 rounded-full blur-[150px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AMBIENT BACKGROUND ORBS */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-900/40 rounded-full blur-[120px]"/>
          <motion.div animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.5, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-800/30 rounded-full blur-[150px]"/>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 pt-16 sm:pt-12">
          
          {/* HEADER */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] mb-2 transition-colors duration-1000">
              Search for a Smile
            </h1>
            <p className="text-gray-300 font-medium text-sm sm:text-lg">
              Official Membership & Volunteer Application
            </p>
          </div>

          {/* DYNAMIC VIEW: Show Success Screen OR the Form */}
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-2xl p-10 sm:p-16 rounded-3xl border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)] text-center mt-20 transition-colors duration-1000"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-colors duration-1000">
                  <Heart size={48} className="text-green-400 transition-colors duration-1000" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Application Received!</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Thank you, <span className="text-green-400 font-bold transition-colors duration-1000">{formData.fullName}</span>. We are thrilled you want to join us. Our team will review your application and reach out to you via WhatsApp or Email shortly.
                </p>
                <button onClick={() => window.location.reload()} className="bg-transparent border border-green-500/50 text-green-400 hover:bg-green-500/10 font-bold py-3 px-8 rounded-xl transition-all duration-1000">
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit} 
                className="flex flex-col lg:flex-row gap-8"
              >
                {/* LEFT COLUMN: FORM */}
                <div className="flex-1 space-y-8">
                  {/* 1. Personal Information */}
                  <section className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-green-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-1000">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-green-500/20 pb-4 text-green-400 transition-colors duration-1000">
                      <span className="bg-green-500/20 text-green-400 border border-green-500/50 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-1000">1</span>
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe" },
                        { label: "Date of Birth", name: "dob", type: "date", placeholder: "" },
                        { label: "Email Address", name: "email", type: "email", placeholder: "john@example.com" },
                        { label: "WhatsApp Number", name: "phone", type: "tel", placeholder: "+232 7X XXX XXX" },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="text-sm font-semibold text-white">{field.label}</label>
                          <input required name={field.name} type={field.type} value={formData[field.name as keyof typeof formData] as string} onChange={handleChange} className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white placeholder-gray-600" placeholder={field.placeholder} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 2. Contact Information */}
                  <section className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-green-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-1000">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-green-500/20 pb-4 text-green-400 transition-colors duration-1000">
                      <span className="bg-green-500/20 text-green-400 border border-green-500/50 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-1000">2</span>
                      Contact Information
                    </h2>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Street Address</label>
                        <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white placeholder-gray-600" placeholder="123 Main St" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white">City</label>
                          <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white placeholder-gray-600" placeholder="Freetown" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white">State / Province</label>
                          <input required name="state" value={formData.state} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white placeholder-gray-600" placeholder="Western Area" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white">Country</label>
                          <input required name="country" value={formData.country} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 3. Membership Details */}
              <section className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-green-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-1000">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-green-500/20 pb-4 text-green-400 transition-colors duration-1000">
                  <span className="bg-green-500/20 text-green-400 border border-green-500/50 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-1000">3</span>
                  Membership Details
                </h2>
                
                <div className="space-y-4">
                  <label className="text-sm font-semibold block mb-2 text-white">Select your role</label>
                  
                  {/* MEMBER OPTION - Added explicit onClick */}
                  <div 
                    onClick={() => setFormData({ ...formData, membershipType: "member" })}
                    className={`block border rounded-xl p-4 cursor-pointer transition-all duration-1000 ${formData.membershipType === "member" ? "border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "border-green-500/30 bg-black/60 hover:border-green-500/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={formData.membershipType === "member"} readOnly className="w-5 h-5 accent-green-500 bg-black border-green-500/50" />
                      <span className={`font-bold text-lg transition-colors duration-1000 ${formData.membershipType === "member" ? "text-green-400" : "text-white"}`}>General Member</span>
                    </div>
                    <p className="ml-8 mt-1 text-sm text-gray-300">
                      Join the core community. Members participate in discussions, vote on initiatives, and commit to a monthly financial contribution.
                    </p>
                  </div>

                  {/* VOLUNTEER OPTION - Added explicit onClick */}
                  <div 
                    onClick={() => setFormData({ ...formData, membershipType: "volunteer" })}
                    className={`block border rounded-xl p-4 cursor-pointer transition-all duration-1000 ${formData.membershipType === "volunteer" ? "border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "border-green-500/30 bg-black/60 hover:border-green-500/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={formData.membershipType === "volunteer"} readOnly className="w-5 h-5 accent-green-500 bg-black border-green-500/50" />
                      <span className={`font-bold text-lg transition-colors duration-1000 ${formData.membershipType === "volunteer" ? "text-green-400" : "text-white"}`}>Volunteer</span>
                    </div>
                    <p className="ml-8 mt-1 text-sm text-gray-300">
                      Offer your time and skills. Volunteers are on the ground, helping organize events, media, and outreach programs.
                    </p>
                  </div>
                </div>
                
                {/* NEW SKILLS TEXTAREA */}
                <div className="mt-8 space-y-2">
                  <label className="text-sm font-semibold block text-white">What are your core skills? <span className="text-green-400">*</span></label>
                  <textarea 
                    required 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all text-white placeholder-gray-500 resize-none" 
                    placeholder="e.g. Graphic Design, Public Speaking, Event Planning, Medical..." 
                  />
                </div>

                <div className="mt-8 space-y-2">
                  <label className="text-sm font-semibold block text-white">How did you hear about us?</label>
                  <select required name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-3 bg-black/60 border border-green-500/30 rounded-xl focus:ring-1 focus:ring-green-400 outline-none transition-all appearance-none cursor-pointer text-white">
                    <option value="" className="bg-black text-white">Select an option...</option>
                    <option value="social" className="bg-black text-white">Social Media</option>
                    <option value="friend" className="bg-black text-white">A friend or family member</option>
                    <option value="event" className="bg-black text-white">Attended a previous event</option>
                    <option value="other" className="bg-black text-white">Other</option>
                  </select>
                </div>
              </section>

                  {/* 4. Agreements */}
                  <section className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-green-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-1000">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
                        <input required type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} className="peer appearance-none w-6 h-6 border-2 border-green-500/50 rounded bg-black checked:bg-green-500 checked:border-green-500 transition-colors duration-1000" />
                        <CheckCircle size={16} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-white text-base">I agree to the terms and conditions</span>
                        <p className="text-gray-400 mt-1">Please read our <button type="button" onClick={() => setIsTermsOpen(true)} className="text-green-400 font-bold hover:text-green-300 underline underline-offset-2 decoration-green-500/50 transition-colors duration-1000">Terms & Conditions</button> before submitting.</p>
                      </div>
                    </label>
                  </section>
                </div>

                {/* RIGHT COLUMN: Submit Sticky Box */}
                <div className="w-full lg:w-96 lg:sticky lg:top-8 h-fit">
                  <div className="bg-black/60 backdrop-blur-2xl border border-green-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden transition-colors duration-1000">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-bl-full blur-2xl pointer-events-none transition-colors duration-1000"></div>
                    <h3 className="text-2xl font-bold mb-4 relative z-10 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] transition-colors duration-1000">We're excited to have you join us!</h3>
                    <p className="text-gray-300 mb-8 text-sm leading-relaxed relative z-10">Once submitted, our team will review your application. You will receive a confirmation email shortly after submission with your next steps.</p>
                    <button type="submit" disabled={isSubmitting || !formData.agreed} className="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 relative z-10">
                      {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" /> : <>Submit Application <ArrowRight size={18} strokeWidth={3} /></>}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* SHIFT THEME BUTTON (Top Right) */}
        <button onClick={triggerShedding} className="fixed top-4 right-4 sm:top-8 sm:right-8 bg-black/60 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors z-[60] shadow-2xl">
          <Palette size={16} /> Shift Theme
        </button>
      </div>

      {/* TERMS MODAL */}
      <AnimatePresence>
        {isTermsOpen && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col border-t border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white tracking-wide">Terms & Conditions</h2>
              <button onClick={() => setIsTermsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 sm:p-12 overflow-y-auto max-w-4xl mx-auto space-y-8 text-white leading-relaxed w-full">
              <p className="text-lg text-gray-300">Welcome to Search for a Smile. By proceeding with this application, you agree to the following commitments to our community.</p>
              <div><h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm">1</span>Active Participation</h3><p className="text-gray-400">We require all members to be active participants in our forums and events. A community thrives on the energy of its people, and inactive members may be removed to keep the group dynamic.</p></div>
              <div><h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm">2</span>Monthly Contributions</h3><p className="text-gray-400">To sustain our charitable efforts and community projects, general members agree to a mandatory monthly contribution. These funds go directly towards our active missions.</p></div>
              <div><h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm">3</span>Community Respect</h3><p className="text-gray-400">We are a charity built on bringing smiles. Any form of harassment, negativity, or disrespect to fellow members will result in immediate termination of membership.</p></div>
              <div className="pt-8 border-t border-gray-800">
                <button onClick={() => { setFormData({...formData, agreed: true}); setIsTermsOpen(false); }} className="bg-white hover:bg-gray-200 text-black font-extrabold py-4 px-8 rounded-xl w-full sm:w-auto transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> I Understand and Agree
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}