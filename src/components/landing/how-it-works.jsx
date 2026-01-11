import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { motionVariants } from '@/lib/animations';
import { Search, Calendar, Heart } from 'lucide-react';

export const HowItWorks = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const steps = [
        {
            num: 1,
            icon: Search,
            title: 'Find Your Care',
            desc: 'Search for hospitals, clinics, or doctors. Filter by specialty and real-time availability.',
        },
        {
            num: 2,
            icon: Calendar,
            title: 'Book Instantly',
            desc: 'Select a time slot or reserve a hospital bed with a secure, one-time online payment.',
        },
        {
            num: 3,
            icon: Heart,
            title: 'Manage & Recover',
            desc: 'Access e-prescriptions, set medicine reminders, and get cashback on your visit.',
        },
    ];

    return (
        <section id="how-it-works" ref={ref} className="container py-12 md:py-24">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">How It Works</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                    A seamless experience designed to get you the right care, right when you need it. In just three simple steps.
                </p>
            </div>

            <motion.div
                className="relative mt-16"
                variants={motionVariants.staggerContainer}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
            >
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />

                <div className="relative grid gap-12 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.num}
                            variants={motionVariants.slideUp(i * 0.1)}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="bg-background border-2 border-primary p-4 rounded-full mb-4 z-10">
                                <step.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.num}. {step.title}</h3>
                            <p className="text-muted-foreground">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};
