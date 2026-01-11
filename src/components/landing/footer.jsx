import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    const [currentYear, setCurrentYear] = useState(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const footerSections = {
        "For patients": [
            { title: "Search for doctors", href: "#" },
            { title: "Search for clinics", href: "#" },
            { title: "Search for hospitals", href: "#" },
            { title: "Book a diagnostic test", href: "#" },
            { title: "Book full body checkups", href: "#" },
            { title: "Read health articles", href: "#" },
        ],
        "For doctors": [
            { title: "Sanjiwani for doctors", href: "#" },
            { title: "Sanjiwani Profile", href: "#" },
        ],
        "For hospitals": [
            { title: "Sanjiwani Profile", href: "#" },
            { title: "Sanjiwani Reach", href: "#" },
        ],
        "For Corporates": [{ title: "Wellness program", href: "#" }],
        "More": [
            { title: "Help", href: "#" },
            { title: "Developers", href: "#" },
            { title: "Privacy Policy", href: "#" },
            { title: "Terms and Conditions", href: "#" },
        ],
        "Social": [
            { title: "Facebook", href: "#" },
            { title: "Twitter", href: "#" },
            { title: "LinkedIn", href: "#" },
            { title: "YouTube", href: "#" },
        ],
    };

    return (
        <footer id="footer" className="bg-slate-900 text-white">
            <div className="container py-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                    {Object.entries(footerSections).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-bold mb-4">{title}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.title}>
                                        <Link to={link.href} className="text-sm text-gray-300 hover:text-red-400">
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.png" alt="Sanjiwani Health Logo" width={32} height={32} />
                        <span className="font-bold text-lg">Sanjiwani Health</span>
                    </div>
                    <p className="text-sm text-gray-400">
                        {currentYear && <>© {currentYear} Sanjiwani Health. All rights reserved.</>}
                    </p>
                </div>
            </div>
        </footer>
    );
};
