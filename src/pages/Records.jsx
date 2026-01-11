import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { healthRecords } from '@/lib/data';
import { Upload, FileText, Download, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RecordsPage() {
    const [formattedRecords, setFormattedRecords] = useState([]);

    useEffect(() => {
        setFormattedRecords(
            healthRecords.map(record => ({
                ...record,
                date: new Date(record.date).toLocaleDateString(),
            }))
        );
    }, []);

    const prescriptions = formattedRecords.filter(r => r.type === 'Prescription');
    const testReports = formattedRecords.filter(r => r.type === 'Test Report');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Health Records</h1>
                <p className="text-muted-foreground">Securely access and manage your prescriptions and test reports.</p>
            </div>

            <Tabs defaultValue="prescriptions">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="reports">Test Reports</TabsTrigger>
                    </TabsList>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" /> Upload New
                    </Button>
                </div>
                <TabsContent value="prescriptions">
                    <RecordTable records={prescriptions} />
                </TabsContent>
                <TabsContent value="reports">
                    <RecordTable records={testReports} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RecordTable({ records }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {record.name}
                                </TableCell>
                                <TableCell>{record.date}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
