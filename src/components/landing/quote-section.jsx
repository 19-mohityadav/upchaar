import { Card, CardContent } from '@/components/ui/card';

export const QuoteSection = () => {
    return (
        <section id="quote" className="py-12 md:py-24">
            <div className="container">
                <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-8 md:p-12 text-center">
                        <p
                            className="font-devanagari text-2xl md:text-3xl lg:text-4xl leading-relaxed md:leading-loose text-primary"
                            lang="sa"
                        >
                            धर्मार्थकाममोक्षाणां स्वास्थ्यं मूलमुत्तमम्।<br />
                            स्वास्थ्यस्य कुशलं श्रेष्ठं स्वास्थ्यं सर्वार्थसाधनम्॥
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};
