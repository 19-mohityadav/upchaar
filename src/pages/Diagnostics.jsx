import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { diagnosticCenters } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { MapPin, FlaskConical } from 'lucide-react';

export default function DiagnosticsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Book a Diagnostic Test</h1>
                <p className="text-muted-foreground">Find reliable diagnostic centers and schedule your tests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {diagnosticCenters.map((center) => (
                    <Card key={center.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <img src={center.logo} alt={center.name} width={56} height={56} className="rounded-lg border" data-ai-hint={center.dataAiHint} />
                                <div>
                                    <CardTitle>{center.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{center.location}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Popular Tests</h4>
                            <div className="flex flex-wrap gap-2">
                                {center.tests.map((test) => (
                                    <Badge key={test} variant="secondary">{test}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Book a Test</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
