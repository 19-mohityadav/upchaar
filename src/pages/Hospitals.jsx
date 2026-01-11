import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hospitals } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building } from 'lucide-react';

export default function HospitalsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Find Hospitals & Clinics</h1>
                <p className="text-muted-foreground">Explore facilities and services offered by hospitals near you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital) => (
                    <Card key={hospital.id} className="overflow-hidden">
                        <img src={hospital.image} alt={hospital.name} width={400} height={250} className="w-full h-48 object-cover" data-ai-hint={hospital.dataAiHint} />
                        <CardHeader>
                            <CardTitle>{hospital.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{hospital.location}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Building className="w-4 h-4" /> Facilities</h4>
                            <div className="flex flex-wrap gap-2">
                                {hospital.facilities.map((facility) => (
                                    <Badge key={facility} variant="outline">{facility}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View Details</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
