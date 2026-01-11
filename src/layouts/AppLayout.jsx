import { Link } from 'react-router-dom';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({ children }) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Sanjiwani Health Logo" width={24} height={24} />
                        <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Sanjiwani</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <MainNav />
                </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex flex-col bg-background">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-0 md:pt-0">
                    <div className="h-24 bg-muted mb-8 flex items-center justify-center rounded-lg">
                        <p className="text-muted-foreground">Ad Space</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}
