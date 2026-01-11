import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            // A small delay to allow the animation to complete before focusing
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        // Close mobile search if menu is opened
        if (isMobile && isMenuOpen) {
            setIsSearchOpen(false);
        }
    }, [isMenuOpen, isMobile]);

    useEffect(() => {
        // Close menu if mobile search is opened
        if (isMobile && isSearchOpen) {
            setIsMenuOpen(false);
        }
    }, [isSearchOpen, isMobile]);


    const navLinks = [
        { href: '/', name: 'Home' },
        { href: '/dashboard', name: 'My Appointments' },
        { href: '#features', name: 'Our Services' },
    ];

    const searchTransition = { duration: 0.4, ease: 'easeInOut' };

    return (
        <header className="w-full">
            <div className="container mx-auto flex h-20 items-center justify-between rounded-full bg-card/80 backdrop-blur-sm px-6 shadow-md">
                {/* Left Section - Logo */}
                <Link to="#footer" className="flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-card">
                        <img src="/logo.png" alt="Sanjiwani Health Logo" width={24} height={24} />
                    </div>
                    <span className="font-bold text-xl text-primary hidden sm:inline-block">
                        Sanjiwani
                    </span>
                </Link>

                {/* Center/Right Section Logic */}
                <div className="flex flex-1 justify-end md:justify-center items-center gap-2">
                    {/* --- Desktop/Tablet Navigation Pill --- */}
                    <div className={cn(
                        "hidden md:flex items-center gap-2 rounded-full border border-primary/30 bg-card/50 p-1 transition-all duration-300 ease-in-out",
                        isSearchOpen ? 'w-full max-w-md' : 'w-auto'
                    )}>
                        <AnimatePresence initial={false}>
                            {isSearchOpen ? (
                                <motion.div
                                    key="search"
                                    initial={{ opacity: 0, width: '0%' }}
                                    animate={{ opacity: 1, width: '100%' }}
                                    exit={{ opacity: 0, width: '0%' }}
                                    transition={searchTransition}
                                    className="relative flex w-full items-center"
                                >
                                    <Search className="absolute left-3 h-5 w-5 text-primary" />
                                    <Input
                                        ref={searchInputRef}
                                        placeholder="Search doctors, hospitals, services…"
                                        className="w-full rounded-full border-none bg-transparent pl-10 pr-10 text-primary placeholder:text-primary/70 focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') setIsSearchOpen(false)
                                        }}
                                    />
                                    <Button onClick={() => setIsSearchOpen(false)} variant="ghost" size="icon" className="absolute right-1 rounded-full text-primary hover:bg-primary/10 hover:text-primary">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="nav"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center"
                                >
                                    <NavigationMenu>
                                        <NavigationMenuList>
                                            {navLinks.map(link => (
                                                <NavigationMenuItem key={link.name}>
                                                    <NavigationMenuLink href={link.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground hover:bg-primary/10 rounded-full font-medium")}>
                                                        {link.name}
                                                    </NavigationMenuLink>
                                                </NavigationMenuItem>
                                            ))}
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                    <Button onClick={() => setIsSearchOpen(true)} variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 hover:text-primary">
                                        <Search className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- Mobile Icons --- */}
                    <div className="flex md:hidden items-center gap-2">
                        <Button onClick={() => setIsSearchOpen(true)} variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                            <Search className="h-6 w-6" />
                        </Button>
                        <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-2 ml-4">
                    <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary" asChild>
                        <Link to="/dashboard">Sign In</Link>
                    </Button>
                    <Button className="rounded-full hover:bg-primary/90 shadow-[0_10px_30px_hsl(var(--primary)/0.15)]" asChild>
                        <Link to="/dashboard">Sign Up</Link>
                    </Button>
                </div>
            </div>

            {/* --- Mobile Menu / Search --- */}
            <AnimatePresence>
                {isMobile && isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden mt-2 p-4"
                    >
                        <div className="relative flex w-full items-center rounded-full bg-card shadow-md p-1 border border-primary/30">
                            <Search className="absolute left-4 h-5 w-5 text-primary" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search..."
                                className="w-full rounded-full border-none bg-transparent pl-11 pr-10 h-12 text-base focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setIsSearchOpen(false)
                                }}
                            />
                            <Button onClick={() => setIsSearchOpen(false)} variant="ghost" size="icon" className="absolute right-2 rounded-full text-primary hover:bg-primary/10">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                    </motion.div>
                )}
                {isMobile && isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: -10 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden mt-2 p-4 bg-card rounded-lg shadow-lg"
                    >
                        <nav className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <Link key={link.href} to={link.href} className="text-foreground font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-border pt-4 flex flex-col gap-3">
                                <Button variant="outline" className="w-full rounded-full border-primary text-primary" asChild>
                                    <Link to="/dashboard">Sign In</Link>
                                </Button>
                                <Button className="w-full rounded-full hover:bg-primary/90 shadow-[0_10px_30px_hsl(var(--primary)/0.15)]" asChild>
                                    <Link to="/dashboard">Sign Up</Link>
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
