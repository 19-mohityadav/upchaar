import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { doctors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, 
    Star, 
    CalendarDays, 
    CheckCircle, 
    Shield, 
    Briefcase, 
    Video, 
    ArrowLeft
} from 'lucide-react';

export default function DoctorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Find the doctor: matching string or number IDs
    const doctor = doctors.find(d => String(d.id) === String(id));

    const [selectedSlot, setSelectedSlot] = useState('');

    if (!doctor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold font-headline">Doctor not found</h2>
                    <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
                    <Button onClick={() => navigate('/doctors')} className="mt-4 bg-teal-600 hover:bg-teal-700">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Doctors
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-teal-50/30 font-sans pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Back button */}
                <Button variant="ghost" className="mb-6 hover:bg-teal-50 text-teal-800" onClick={() => navigate('/doctors')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Doctors
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Left Column: Doctor Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg ring-1 ring-black/5 overflow-hidden rounded-2xl bg-white">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl p-1 bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md">
                                            <img
                                                src={doctor.avatar}
                                                alt={doctor.name}
                                                className="h-full w-full rounded-xl object-cover border-4 border-white bg-white"
                                            />
                                        </div>
                                        {doctor.verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Doctor">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-headline">{doctor.name}</h1>
                                                <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200 shadow-sm">
                                                    <span>{doctor.rating}</span>
                                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                </div>
                                            </div>
                                            <p className="text-teal-600 font-semibold text-lg mt-1">{doctor.specialty}</p>
                                            <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
                                                <MapPin className="h-4 w-4 text-gray-400" /> {doctor.location}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-gray-100/80 text-sm text-gray-600">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg shadow-sm">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">License</p>
                                                    <p className="font-semibold text-gray-700">DOC-{Math.floor(Math.random() * 90000) + 10000}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg shadow-sm">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Experience</p>
                                                    <p className="font-semibold text-gray-700">{doctor.experience} Years</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-3 flex-wrap">
                                            {doctor.languages && doctor.languages.map((lang, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium px-3 py-1 rounded-full">{lang}</Badge>
                                            ))}
                                            {(!doctor.languages || doctor.languages.length === 0) && (
                                                <>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium px-3 py-1 rounded-full">English</Badge>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium px-3 py-1 rounded-full">Hindi</Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-100 shadow-xl shadow-teal-900/5 bg-white rounded-2xl overflow-hidden sticky top-24">
                            <div className="p-6 text-center space-y-1">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Book an Appointment</h2>
                                <p className="text-sm text-gray-500 font-medium">Book in just 2 clicks!</p>
                            </div>

                            <div className="px-6 pb-5 text-center">
                                <p className="text-[11px] text-teal-600/80 uppercase tracking-widest font-bold mb-1">Consultation Fee</p>
                                <p className="text-4xl font-bold text-teal-600">₹{doctor.fees}</p>
                            </div>

                            {/* In-Clinic Section */}
                            <div className="border-t border-gray-100 px-6 py-6 space-y-4">
                                <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2">
                                    <CalendarDays className="h-5 w-5" />
                                    <h3 className="tracking-tight text-lg">In-Clinic Appointment</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-[13px] text-gray-500 font-semibold text-center bg-gray-50 py-1.5 rounded-full">
                                        Select Date & Time (Today)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((time) => (
                                            <Button 
                                                key={time} 
                                                variant={selectedSlot === time ? 'default' : 'outline'}
                                                className={selectedSlot === time 
                                                    ? "bg-teal-600 hover:bg-teal-700 shadow-md font-semibold text-white ring-1 ring-teal-700" 
                                                    : "border-gray-200 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium"
                                                }
                                                onClick={() => setSelectedSlot(time)}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 h-12 text-base font-bold transition-all">
                                    Book In-Clinic Visit
                                </Button>
                            </div>

                            {/* Video Consultation Section */}
                            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5 space-y-4">
                                <div className="flex items-center justify-center gap-2 text-teal-700 font-semibold">
                                    <Video className="h-5 w-5" />
                                    <h3 className="tracking-tight">Video Consultation</h3>
                                </div>
                                <p className="text-xs text-center text-gray-500">Consult from the comfort of your home.</p>
                                <Button variant="outline" className="w-full h-11 bg-white border-gray-200 hover:border-teal-600 hover:text-teal-700 hover:bg-teal-50 hover:shadow-sm transition-all font-semibold">
                                    Request Video Consultation
                                </Button>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="border-t border-gray-100 px-6 py-5 space-y-3 bg-gray-50">
                                <div className="flex justify-between text-sm text-gray-600 font-medium">
                                    <span>Consultation Fee:</span>
                                    <span>₹{doctor.fees}.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 font-medium">
                                    <span>Platform Fee:</span>
                                    <span>₹50.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200 mt-3 text-base">
                                    <span>Total Payable:</span>
                                    <span className="text-teal-600">₹{parseInt(doctor.fees) + 50}.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
