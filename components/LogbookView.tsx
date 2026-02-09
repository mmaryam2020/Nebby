
import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';

interface LogbookViewProps {
    entries: LogEntry[];
    onSave: (mood: number, text: string) => void;
}

const moodConfig = [
    { value: 1, label: 'System Critical', description: 'Energy depleted. Emergency power only.', icon: 'battery_alert', color: 'text-red-400', border: 'border-red-400' },
    { value: 2, label: 'Low Visibility', description: 'Sensors foggy. Navigation offline.', icon: 'cloud_off', color: 'text-indigo-400', border: 'border-indigo-400' },
    { value: 3, label: 'Steady Course', description: 'Systems nominal. Holding steady.', icon: 'flight', color: 'text-cyan-400', border: 'border-cyan-400' },
    { value: 4, label: 'Full Impulse', description: 'Engines optimized. Making good time.', icon: 'bolt', color: 'text-purple-400', border: 'border-purple-400' },
    { value: 5, label: 'Warp Speed', description: 'Maximum output. Unstoppable.', icon: 'rocket_launch', color: 'text-yellow-400', border: 'border-yellow-400' },
];

export const LogbookView: React.FC<LogbookViewProps> = ({ entries, onSave }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    
    // Initialize mood with today's entry if it exists, otherwise default to 3
    const [selectedMood, setSelectedMood] = useState(todayEntry?.mood || 3);
    const [logText, setLogText] = useState('');
    const [hasUnsavedMoodChange, setHasUnsavedMoodChange] = useState(false);

    useEffect(() => {
        if (todayEntry) {
            setSelectedMood(todayEntry.mood);
        }
    }, [todayEntry]);

    const handleMoodChange = (mood: number) => {
        setSelectedMood(mood);
        setHasUnsavedMoodChange(true);
    };

    const handleSave = () => {
        if (!logText.trim() && !hasUnsavedMoodChange) return;
        
        onSave(selectedMood, logText);
        setLogText('');
        setHasUnsavedMoodChange(false);
    };

    const currentMoodInfo = moodConfig.find(m => m.value === selectedMood) || moodConfig[2];

    return (
        <div className="stardust-entry space-y-5 pb-24">
            {/* Header */}
            <div className="text-center space-y-0.5">
                <h1 className="text-xl font-bold tracking-tight text-white">Captain's Log</h1>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Stardate {today}</p>
            </div>

            {/* Mood Selector Console */}
            <section className="glass p-4 rounded-3xl space-y-3 relative overflow-hidden">
                {/* Background glow based on mood */}
                <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${currentMoodInfo.color.replace('text-', 'from-')}/20 to-transparent -z-10 blur-xl opacity-50`}></div>

                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-xs text-slate-400">monitor_heart</span>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Energy Signature</h2>
                </div>

                {/* Mood Icons Row */}
                <div className="flex justify-between items-center px-1 relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/10 -z-10 transform -translate-y-1/2"></div>
                    
                    {moodConfig.map((m) => {
                         const isSelected = selectedMood === m.value;
                         return (
                            <button
                                key={m.value}
                                onClick={() => handleMoodChange(m.value)}
                                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? `bg-slate-900 scale-125 border-2 ${m.border} ${m.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'bg-slate-900 border border-white/20 text-slate-500 hover:text-slate-300 hover:scale-110'}`}
                            >
                                <span className="material-symbols-outlined text-base">{m.icon}</span>
                            </button>
                         );
                    })}
                </div>

                {/* Selected Mood Description Display */}
                <div className={`glass-card p-3 rounded-xl border-l-2 ${currentMoodInfo.border} transition-all duration-300`}>
                     <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`text-sm font-bold ${currentMoodInfo.color}`}>{currentMoodInfo.label}</h3>
                            <p className="text-xs text-slate-300 mt-0.5">{currentMoodInfo.description}</p>
                        </div>
                        <div className="text-right">
                             <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Level</span>
                             <span className={`text-lg font-black ${currentMoodInfo.color}`}>{currentMoodInfo.value}/5</span>
                        </div>
                     </div>
                </div>
            </section>

            {/* Text Entry Section */}
            <section className="space-y-2">
                 <div className="flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-xs text-slate-400">edit_note</span>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplemental Entry</h2>
                </div>
                <div className="glass rounded-3xl p-1">
                    <textarea
                        className="w-full bg-slate-900/50 rounded-2xl px-4 py-3 text-sm placeholder-slate-600 resize-none border border-transparent focus:border-white/10 focus:ring-0 text-slate-200 min-h-[100px]"
                        placeholder="Log your mission notes, observations, or thoughts..."
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                    />
                    <div className="flex justify-end p-2">
                        <button
                            onClick={handleSave}
                            disabled={!logText.trim() && !hasUnsavedMoodChange}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-xs">send</span>
                            Transmit
                        </button>
                    </div>
                </div>
            </section>

            {/* History Feed */}
            {entries.length > 0 && (
                <section className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-xs text-slate-400">history</span>
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mission History</h2>
                    </div>
                    <div className="space-y-3">
                        {entries.map((entry) => {
                             const moodInfo = moodConfig.find(m => m.value === entry.mood) || moodConfig[2];
                             return (
                                <div key={entry.id} className="glass-card p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                             <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${moodInfo.border} ${moodInfo.color} bg-white/5`}>
                                                <span className="material-symbols-outlined text-[10px]">{moodInfo.icon}</span>
                                             </div>
                                             <div>
                                                 <p className="text-xs font-bold text-slate-300">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                 <p className={`text-[9px] font-bold uppercase tracking-wider ${moodInfo.color}`}>{moodInfo.label}</p>
                                             </div>
                                        </div>
                                    </div>
                                    {entry.text && <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.text}</p>}
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};
