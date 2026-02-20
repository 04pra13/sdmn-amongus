'use client';

import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Star Field Background */}
            <div className="star-field" />

            {/* Tumbling Crewmate */}
            <div className="absolute w-full h-full pointer-events-none">
                <motion.div
                    initial={{ x: -100, y: '50%', rotate: 0 }}
                    animate={{
                        x: '120vw',
                        y: ['45%', '55%', '45%'], // Slight floating wobble
                        rotate: 360
                    }}
                    transition={{
                        duration: 8,
                        ease: "linear",
                        repeat: Infinity,
                        y: {
                            duration: 4,
                            ease: "easeInOut",
                            repeat: Infinity
                        }
                    }}
                    className="absolute left-0 top-1/2  z-[999] -translate-y-1/2 w-24 h-24 md:w-32 md:h-32"
                >
                    <img className='w-full h-full ' src="https://i.redd.it/ph2jho4o1sn51.png" />
                </motion.div>
            </div>

            {/* Uncovering Text */}
            <div className="relative z-10 mt-32">
                <TypingText text="Among us is loading..." />
            </div>
        </div>
    );
}



function TypingText({ text }: { text: string }) {
    const letters = Array.from(text);

    return (
        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl  italic tracking-widest text-white flex overflow-hidden z-[99]">
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{
                        duration: 0.1,
                        delay: index * 0.1,
                        ease: "easeOut"
                    }}
                    className="inline-block whitespace-pre"
                >
                    {letter}
                </motion.span>
            ))}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-3 h-10 bg-imposter ml-2 align-middle"
            />
        </h2>
    );
}
