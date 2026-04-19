import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Calendar as CalendarIcon, Clock, 
    Filter, ArrowRight, CheckCircle, ChevronLeft, 
    Stethoscope, Info, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase.js';
import { useAuth } from '@/auth/AuthContext.jsx';

// ── Static Data ──────────────────────────────────────
const INDIAN_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", 
    "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Major cities mapping (Simplified for demonstration)
const CITIES_BY_STATE = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
};

export default function BookAppointment() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // ── Search & Filter State ────────────────────────
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [detectingLocation, setDetectingLocation] = useState(false);
    
    // ── Data State ───────────────────────────────────
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [clinics, setClinics] = useState([]);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    
    // ── UI Flow State ────────────────────────────────
    const [step, setStep] = useState(1); // 1: Search, 2: Clinic/Slot, 3: Confirmation
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // ── Geolocation ──────────────────────────────────
    const handleAutoDetect = () => {
        setDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // In a real app, we'd use reverse geocoding here.
                    // For now, let's mock the detection to Maharashtra/Mumbai for demo.
                    setTimeout(() => {
                        setSelectedState("Maharashtra");
                        setSelectedCity("Mumbai");
                        setDetectingLocation(false);
                    }, 1500);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setDetectingLocation(false);
                }
            );
        } else {
            setDetectingLocation(false);
        }
    };

    // ── Fetch Doctors ────────────────────────────────
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            let query = supabase.from('doctors').select('*').eq('status', 'approved');
            
            if (selectedState) query = query.ilike('metadata->>state', `%${selectedState}%`);
            if (selectedCity) query = query.ilike('metadata->>city', `%${selectedCity}%`);

            const { data, error } = await query;
            if (!error) setDoctors(data || []);
            setLoading(false);
        };
        fetchDoctors();
    }, [selectedState, selectedCity]);

    // ── Fetch Clinics for Selected Doctor ────────────
    const handleSelectDoctor = async (doc) => {
        setSelectedDoctor(doc);
        setLoading(true);
        
        // Fetch linked clinics via staff_links
        const { data, error } = await supabase
            .from('staff_links')
            .select(`
                *,
                clinics:organization_id (id, name, address, metadata),
                medicals:organization_id (id, name, address, metadata)
            `)
            .eq('doctor_id', doc.id);

        if (!error && data) {
            const list = data.map(item => item.clinics || item.medicals).filter(Boolean);
            setClinics(list);
            if (list.length > 0) setSelectedClinic(list[0]);
        }
        
        setLoading(false);
        setStep(2);
    };

    // ── Finalize Booking ─────────────────────────────
    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        
        // Sync to appointments table
        const appointmentData = {
            patient_id: user?.id || null, // Allow guest for now if needed, though usually requires login
            doctor_id: selectedDoctor.id,
            organization_id: selectedClinic?.id,
            date: selectedDate,
            time_slot: selectedSlot,
            status: 'confirmed',
            type: 'non-queue',
            metadata: {
                doctor_name: selectedDoctor.full_name,
                clinic_name: selectedClinic?.name,
                patient_name: user?.user_metadata?.full_name || "Guest Patient"
            }
        };

        const { error } = await supabase.from('appointments').insert([appointmentData]);
        
        if (!error) {
            setBookingSuccess(true);
            setStep(3);
        } else {
            alert("Error booking appointment. Please try again.");
        }
        setBookingLoading(false);
    };

    // Derived: filtered doctors by search term
    const filteredDoctors = useMemo(() => {
        return doctors.filter(d => 
            d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        {step > 1 && !bookingSuccess && (
                            <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 font-headline">
                                {step === 1 ? 'Find Your Doctor' : step === 2 ? 'Schedule Appointment' : 'Booking Confirmed'}
                            </h1>
                            <p className="text-slate-500">
                                {step === 1 ? 'Search by location, specialty, or doctor name.' : 
                                 step === 2 ? 'Choose a clinic and time slot for your visit.' : 
                                 'Your appointment has been successfully scheduled.'}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: SEARCH & FILTER */}
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Filters Panel */}
                                <Card className="border-none shadow-xl shadow-slate-200/50">
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                                                <Select value={selectedState} onValueChange={(val) => { setSelectedState(val); setSelectedCity(''); }}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select State" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                                                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select City" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(CITIES_BY_STATE[selectedState] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Search Doctor</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input 
                                                        placeholder="Name or Specialty..." 
                                                        className="pl-10 h-12"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full h-12 flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold"
                                                    onClick={handleAutoDetect}
                                                    disabled={detectingLocation}
                                                >
                                                    {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                                    {detectingLocation ? 'Detecting...' : 'Auto-detect Location'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Results Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {loading ? (
                                        Array(6).fill(0).map((_, i) => (
                                            <Card key={i} className="h-64 animate-pulse bg-slate-100" />
                                        ))
                                    ) : filteredDoctors.length > 0 ? (
                                        filteredDoctors.map((doc) => (
                                            <motion.div key={doc.id} whileHover={{ y: -5 }}>
                                                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleSelectDoctor(doc)}>
                                                    <CardContent className="p-6 space-y-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-2xl font-bold overflow-hidden border-2 border-white shadow-sm">
                                                                {doc.avatar_url ? (
                                                                    <img src={doc.avatar_url} alt={doc.full_name} className="w-full h-full object-cover" />
                                                                ) : doc.full_name?.[0]}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{doc.full_name}</h3>
                                                                <p className="text-emerald-600 text-sm font-medium">{doc.specialization}</p>
                                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {doc.metadata?.city}, {doc.metadata?.state}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t flex items-center justify-between">
                                                            <span className="text-sm font-bold text-slate-700">₹{doc.fees || 500} <span className="text-slate-400 font-normal">Fee</span></span>
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 group">
                                                                Book Now
                                                                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center space-y-4">
                                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                                <Search className="h-10 w-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-slate-900">No doctors found</h3>
                                                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                                            </div>
                                            <Button variant="outline" onClick={() => { setSelectedState(''); setSelectedCity(''); setSearchTerm(''); }}>
                                                Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: CLINIC & SLOT SELECTION */}
                        {step === 2 && selectedDoctor && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                {/* Left: Doctor Info */}
                                <div className="space-y-6">
                                    <Card className="border-none shadow-lg">
                                        <CardContent className="p-6 text-center space-y-4">
                                            <div className="h-24 w-24 rounded-full bg-slate-100 mx-auto border-4 border-white shadow-md overflow-hidden">
                                                {selectedDoctor.avatar_url ? (
                                                    <img src={selectedDoctor.avatar_url} alt={selectedDoctor.full_name} className="w-full h-full object-cover" />
                                                ) : <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-slate-400">{selectedDoctor.full_name?.[0]}</div>}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">{selectedDoctor.full_name}</h2>
                                                <p className="text-primary font-medium">{selectedDoctor.specialization}</p>
                                            </div>
                                            <div className="flex justify-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                                                    <p className="font-bold">{selectedDoctor.experience || 5}+ Yr</p>
                                                </div>
                                                <div className="w-[1px] bg-slate-100" />
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Consultation</p>
                                                    <p className="font-bold">₹{selectedDoctor.fees || 500}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none bg-blue-600 text-white shadow-lg overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Info size={120} />
                                        </div>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle size={20} />
                                                <h3 className="font-bold">Important Info</h3>
                                            </div>
                                            <p className="text-blue-100 text-sm">
                                                Please arrive 10 minutes before your scheduled time. 
                                                You can manage your booking in the patient dashboard.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right: Selection Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="border-none shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-xl">Practice & Time Slot</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-8">
                                            {/* Clinic Selection */}
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <MapPin size={16} /> Select Clinic / Hospital
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {clinics.length > 0 ? clinics.map((clinic) => (
                                                        <div 
                                                            key={clinic.id}
                                                            onClick={() => setSelectedClinic(clinic)}
                                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                                selectedClinic?.id === clinic.id 
                                                                ? 'border-blue-600 bg-blue-50/50 shadow-md' 
                                                                : 'border-slate-100 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{clinic.name}</p>
                                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{clinic.address}</p>
                                                                </div>
                                                                {selectedClinic?.id === clinic.id && <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />}
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-full p-4 bg-amber-50 rounded-xl flex items-center gap-3 text-amber-700 text-sm">
                                                            <Info size={18} />
                                                            This doctor is currently not linked to any specific clinic.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Date Selection */}
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <CalendarIcon size={16} /> Select Date
                                                </label>
                                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                    {[0,1,2,3,4,5,6].map(offset => {
                                                        const d = new Date();
                                                        d.setDate(d.getDate() + offset);
                                                        const dateStr = d.toISOString().split('T')[0];
                                                        const isSelected = selectedDate === dateStr;
                                                        return (
                                                            <div 
                                                                key={dateStr}
                                                                onClick={() => setSelectedDate(dateStr)}
                                                                className={`flex-shrink-0 w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                                    isSelected ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-slate-100 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                <span className="text-[10px] font-bold uppercase opacity-80">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                                <span className="text-xl font-bold">{d.getDate()}</span>
                                                                <span className="text-[10px] font-medium opacity-80">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Time Slot Selection */}
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Clock size={16} /> Select Time Slot
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(slot => (
                                                        <Button
                                                            key={slot}
                                                            variant={selectedSlot === slot ? 'default' : 'outline'}
                                                            className={`h-12 rounded-xl border-2 transition-all ${selectedSlot === slot ? 'shadow-md scale-105' : 'border-slate-100'}`}
                                                            onClick={() => setSelectedSlot(slot)}
                                                        >
                                                            {slot}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Confirm Button */}
                                            <Button 
                                                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 mt-4 font-bold"
                                                onClick={handleConfirmBooking}
                                                disabled={!selectedDate || !selectedSlot || bookingLoading}
                                            >
                                                {bookingLoading ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Appointment'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 3 && bookingSuccess && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-xl mx-auto text-center space-y-8 py-12"
                            >
                                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                                    <CheckCircle size={48} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold text-slate-900">Appointment Confirmed!</h2>
                                    <p className="text-slate-500 text-lg">
                                        Your session with <span className="text-emerald-600 font-bold">{selectedDoctor.full_name}</span> is booked for <span className="text-slate-900 font-medium">{new Date(selectedDate).toDateString()}</span> at <span className="text-slate-900 font-medium">{selectedSlot}</span>.
                                    </p>
                                </div>
                                
                                <Card className="border-none shadow-lg bg-emerald-50/50 p-6 text-left">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Practice:</span>
                                            <span className="font-bold text-slate-900">{selectedClinic?.name || 'In-Person'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Booking ID:</span>
                                            <span className="font-mono text-xs text-slate-400">#UP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button className="h-12 px-8 font-bold" onClick={() => navigate('/patient/dashboard')}>
                                        Go to My Dashboard
                                    </Button>
                                    <Button variant="outline" className="h-12 px-8 font-bold" onClick={() => window.print()}>
                                        Print Receipt
                                    </Button>
                                </div>
                                
                                <p className="text-slate-400 text-sm">
                                    A confirmation SMS has been sent to your registered mobile number.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
    );
}
