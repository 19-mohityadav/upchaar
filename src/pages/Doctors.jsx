import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { doctors } from '@/lib/data';
import { MapPin, Search } from 'lucide-react';

export default function DoctorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('all');
    const [availableToday, setAvailableToday] = useState(false);
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);

    useEffect(() => {
        const filterDoctors = () => {
            let results = doctors;

            if (searchTerm) {
                results = results.filter(doctor =>
                    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (location !== 'all') {
                const city = location.charAt(0).toUpperCase() + location.slice(1);
                results = results.filter(doctor => doctor.location.includes(city));
            }

            if (availableToday) {
                results = results.filter(doctor => doctor.availability === 'Available Today');
            }

            setFilteredDoctors(results);
        };

        filterDoctors();
    }, [searchTerm, location, availableToday]);

    const handleSearch = (e) => {
        e.preventDefault();
        // The useEffect already handles filtering, but we keep this to prevent form submission.
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Find a Doctor</h1>
                <p className="text-muted-foreground">Search for specialists and book appointments with ease.</p>
            </div>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="doctor-name">Name or Specialty</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="doctor-name"
                                    placeholder="e.g., Dr. Sharma or Cardiologist"
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Select onValueChange={setLocation} value={location}>
                                <SelectTrigger id="location">
                                    <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    <SelectItem value="delhi">Delhi</SelectItem>
                                    <SelectItem value="mumbai">Mumbai</SelectItem>
                                    <SelectItem value="bangalore">Bangalore</SelectItem>
                                    <SelectItem value="pune">Pune</SelectItem>
                                    <SelectItem value="gurgaon">Gurgaon</SelectItem>
                                    <SelectItem value="lucknow">Lucknow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="availability"
                                checked={availableToday}
                                onCheckedChange={setAvailableToday}
                            />
                            <Label htmlFor="availability">Available Today</Label>
                        </div>
                        <Button type="submit" className="w-full">Search</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="flex flex-col">
                            <CardHeader className="items-center text-center">
                                <img src={doctor.avatar} alt={doctor.name} width={80} height={80} className="rounded-full mb-2" data-ai-hint={doctor.dataAiHint} />
                                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                <CardDescription>{doctor.specialty}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                                    <span>{doctor.location}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Badge variant={doctor.availability === 'Available Today' ? 'default' : 'secondary'} className="w-fit">
                                    {doctor.availability}
                                </Badge>
                                <Button className="w-full mt-2">Book Appointment</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground">No doctors found matching your criteria.</p>
                )}
            </div>
        </div>
    );
}
