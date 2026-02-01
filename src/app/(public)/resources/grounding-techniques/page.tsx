import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Grounding Techniques",
    description: "Learn effective grounding techniques to manage anxiety, stress, and overwhelming emotions.",
};

export default function GroundingTechniquesPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Grounding <span className="text-gradient-mixed">Techniques</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Grounding techniques help you stay present and manage overwhelming
                            emotions. Use these exercises when you feel anxious, stressed, or disconnected.
                        </p>
                    </div>
                </div>
            </section>

            {/* Techniques */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto space-y-12">
                        {/* 5-4-3-2-1 Technique */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-[var(--primary-teal)] mb-4">
                                5-4-3-2-1 Technique
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This sensory awareness exercise helps bring you back to the present moment.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-full bg-[var(--primary-teal)] text-white flex items-center justify-center font-bold flex-shrink-0">5</span>
                                    <div>
                                        <h4 className="font-semibold">Things you can SEE</h4>
                                        <p className="text-gray-500 text-sm">Look around and name 5 things you can see right now.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-full bg-[var(--primary-teal)] text-white flex items-center justify-center font-bold flex-shrink-0">4</span>
                                    <div>
                                        <h4 className="font-semibold">Things you can TOUCH</h4>
                                        <p className="text-gray-500 text-sm">Notice 4 things you can physically feel (chair, clothes, floor).</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-full bg-[var(--primary-teal)] text-white flex items-center justify-center font-bold flex-shrink-0">3</span>
                                    <div>
                                        <h4 className="font-semibold">Things you can HEAR</h4>
                                        <p className="text-gray-500 text-sm">Listen for 3 sounds in your environment.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-full bg-[var(--primary-teal)] text-white flex items-center justify-center font-bold flex-shrink-0">2</span>
                                    <div>
                                        <h4 className="font-semibold">Things you can SMELL</h4>
                                        <p className="text-gray-500 text-sm">Identify 2 scents around you.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-full bg-[var(--primary-teal)] text-white flex items-center justify-center font-bold flex-shrink-0">1</span>
                                    <div>
                                        <h4 className="font-semibold">Thing you can TASTE</h4>
                                        <p className="text-gray-500 text-sm">Notice 1 taste in your mouth.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box Breathing */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-[var(--primary-purple)] mb-4">
                                Box Breathing
                            </h2>
                            <p className="text-gray-600 mb-6">
                                A simple breathing technique to calm your nervous system.
                            </p>
                            <div className="grid grid-cols-2 gap-4 max-w-sm">
                                <div className="aspect-square bg-[var(--primary-purple)]/10 rounded-lg flex flex-col items-center justify-center p-4">
                                    <span className="text-3xl font-bold text-[var(--primary-purple)]">4s</span>
                                    <span className="text-sm text-gray-600 mt-2">Breathe In</span>
                                </div>
                                <div className="aspect-square bg-[var(--primary-purple)]/10 rounded-lg flex flex-col items-center justify-center p-4">
                                    <span className="text-3xl font-bold text-[var(--primary-purple)]">4s</span>
                                    <span className="text-sm text-gray-600 mt-2">Hold</span>
                                </div>
                                <div className="aspect-square bg-[var(--primary-purple)]/10 rounded-lg flex flex-col items-center justify-center p-4">
                                    <span className="text-3xl font-bold text-[var(--primary-purple)]">4s</span>
                                    <span className="text-sm text-gray-600 mt-2">Breathe Out</span>
                                </div>
                                <div className="aspect-square bg-[var(--primary-purple)]/10 rounded-lg flex flex-col items-center justify-center p-4">
                                    <span className="text-3xl font-bold text-[var(--primary-purple)]">4s</span>
                                    <span className="text-sm text-gray-600 mt-2">Hold</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mt-4">Repeat for 4-5 cycles.</p>
                        </div>

                        {/* Body Scan */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-[var(--secondary-green)] mb-4">
                                Quick Body Scan
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Bring awareness to your body to release tension and ground yourself.
                            </p>
                            <ol className="list-decimal list-inside text-gray-600 space-y-3">
                                <li>Close your eyes or soften your gaze</li>
                                <li>Notice your feet on the ground</li>
                                <li>Feel the weight of your body in your seat</li>
                                <li>Relax your shoulders down from your ears</li>
                                <li>Unclench your jaw and relax your face</li>
                                <li>Take three deep breaths</li>
                            </ol>
                        </div>

                        {/* Physical Grounding */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Physical Grounding
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Simple physical actions to anchor yourself in the present.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    "Hold an ice cube in your hand",
                                    "Splash cold water on your face",
                                    "Press your feet firmly into the ground",
                                    "Squeeze a stress ball",
                                    "Touch different textures around you",
                                    "Take a short walk",
                                ].map((technique, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="text-[var(--primary-teal)]">✓</span>
                                        <span className="text-gray-700">{technique}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
