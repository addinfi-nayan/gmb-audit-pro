"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const NAMES = [
    "Mohit", "Rahul", "Priya", "Sneha", "Amit", "Vikram", "Anjali", "Rohit", "Neha", "Suresh",
    "Deepak", "Kavita", "Arjun", "Divya", "Sanjay", "Meera", "Varun", "Pooja", "Raj", "Simran"
];

const ACTIONS = [
    "just downloaded the audit report",
    "analyzed their GMB profile",
    "found 3 missing keywords",
    "generated a competitor report",
    "checked their local ranking",
    "optimized their business profile",
    "spotted a listing error",
    "improved their SEO score"
];

const TIMES = [
    "Just now",
    "2 seconds ago",
    "5 seconds ago",
    "12 seconds ago",
    "1 minute ago",
    "2 minutes ago"
];

const RecentActivity = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState({ name: "", action: "", time: "" });

    useEffect(() => {
        // Initial delay before starting the loop
        const initialTimeout = setTimeout(() => {
            showNotification();
        }, 3000);

        return () => clearTimeout(initialTimeout);
    }, []);

    const showNotification = () => {
        // Randomly select data
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        // Obfuscate name (e.g., "Mohit" -> "Moh***")
        const obfuscatedName = name.substring(0, 3) + "***";

        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const time = TIMES[Math.floor(Math.random() * TIMES.length)];

        setNotification({ name: obfuscatedName, action, time });
        setIsVisible(true);

        // Hide after 4-6 seconds
        const hideDelay = Math.random() * 2000 + 4000;
        setTimeout(() => {
            setIsVisible(false);

            // Show next after random interval (8-15 seconds)
            const nextDelay = Math.random() * 7000 + 8000;
            setTimeout(showNotification, nextDelay);
        }, hideDelay);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: -20 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="fixed bottom-4 left-4 z-50 max-w-[300px] md:max-w-sm w-full"
                >
                    <div className="bg-[#0B1120]/90 backdrop-blur-md border border-blue-500/20 shadow-2xl shadow-blue-500/10 rounded-xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {notification.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">
                                <span className="text-cyan-400 font-bold">{notification.name}</span> {notification.action}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{notification.time}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RecentActivity;
