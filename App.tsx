
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mode, Task, View, Tab, CompletedTask, LogEntry } from './types';
import { processBrainDump } from './services/geminiService';
import { Nebby } from './components/Nebby';
import { StarsBackground } from './components/StarsBackground';
import { BottomNav } from './components/BottomNav';
import { ConsoleView } from './components/ConsoleView';
import { ExpeditionsView } from './components/ExpeditionsView';
import { StarMapView } from './components/StarMapView';
import { CargoHoldView } from './components/CargoHoldView';
import { TriageView } from './components/TriageView';
import { LogbookView } from './components/LogbookView';
import { VoidModal } from './components/VoidModal';

// --- DATA & STATE ---
const INITIAL_STATE = {
    dynamicTasks: [
        { id: 1, text: "Respond to essential comms", type: 'quietNebula', energyLevel: 2, createdAt: Date.now() },
        { id: 2, text: "Submit flight report X", type: 'supernova', energyLevel: 3, createdAt: Date.now() },
        { id: 3, text: "Study asteroid physics", type: 'supernova', energyLevel: 4, createdAt: Date.now() }
    ] as Task[],
    initialStars: [
        { id: 9001, type: 'default', x: 20, y: 30 },
        { id: 9002, type: 'default', x: 25, y: 25 },
        { id: 9003, type: 'default', x: 35, y: 32 },
        { id: 9004, type: 'default', x: 50, y: 50 },
        { id: 9005, type: 'default', x: 53, y: 58 },
        { id: 9006, type: 'default', x: 70, y: 70 },
        { id: 9007, type: 'default', x: 78, y: 65 },
        { id: 9008, type: 'default', x: 85, y: 75 },
    ] as CompletedTask[],
    defaultBacklog: [
        { id: 101, text: "Recalibrate long-range sensors", type: 'quietNebula', expeditionId: 1, expeditionTitle: "Orion Spur Cleanup", energyLevel: 2, createdAt: Date.now() },
        { id: 102, text: "Patch micrometeoroid hull damage", type: 'quietNebula', expeditionId: 1, expeditionTitle: "Orion Spur Cleanup", energyLevel: 3, createdAt: Date.now() },
        { id: 201, text: "Analyze atmospheric composition", type: 'supernova', expeditionId: 2, expeditionTitle: "Explore Kepler-186f", energyLevel: 5, createdAt: Date.now() },
        // Seeded old task for demonstration of Evaporation Protocol
        { id: 999, text: "Old navigation charts (Expired)", type: 'quietNebula', energyLevel: 1, createdAt: Date.now() - (31 * 24 * 60 * 60 * 1000) } 
    ] as Task[],
    protocols: {
        morning: {
            quietNebula: ["Drink 250ml Fuel", "3 Mins Deep Breath", "Life Sign Check"],
            supernova: ["Cold Shower", "3 High-Energy Targets", "Galactic Strategy"]
        },
        evening: {
            quietNebula: ["Dim Lights", "Gratitude Log", "Manual Shutdown"],
            supernova: ["Review Logs", "Prep Next Gear", "Stretch Routines"]
        }
    },
    quotes: {
        quietNebula: [
            "Engines cooling down. Let's keep life-support running.",
            "Even stars need to dim sometimes to save fuel.",
            "Safe orbit achieved. No heavy lifting required.",
            "Quiet sectors today. Just drift and breathe."
        ],
        supernova: [
            "Thrusters at 100%! Let's conquer some galaxies!",
            "Warp drive active. High-priority missions prioritized.",
            "Energy levels at peak. Go for launch!",
            "Plotting a course for maximum results, Captain."
        ]
    }
};

// Helper to load state from Local Storage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
        console.warn(`Failed to load ${key} from storage`, e);
        return fallback;
    }
};

const App: React.FC = () => {
    // Persistent State
    const [view, setView] = useState<View>(() => loadFromStorage('nebby_view', View.Scan));
    const [mode, setMode] = useState<Mode>(() => loadFromStorage('nebby_mode', Mode.QuietNebula));
    const [fuelLevel, setFuelLevel] = useState<number>(() => loadFromStorage('nebby_fuel', 30));
    const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('nebby_tasks', INITIAL_STATE.dynamicTasks));
    const [activeTab, setActiveTab] = useState<Tab>(() => loadFromStorage('nebby_tab', Tab.Console));
    const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => loadFromStorage('nebby_completedStars', INITIAL_STATE.initialStars));
    const [streak, setStreak] = useState(() => loadFromStorage('nebby_streak', 0));
    const [backlog, setBacklog] = useState<Task[]>(() => loadFromStorage('nebby_backlog', INITIAL_STATE.defaultBacklog));
    const [logEntries, setLogEntries] = useState<LogEntry[]>(() => loadFromStorage('nebby_logbook', []));
    const [voidTasks, setVoidTasks] = useState<Task[]>(() => loadFromStorage('nebby_void', []));

    // Ephemeral State
    const [brainDump, setBrainDump] = useState('');
    const [isSwallowing, setIsSwallowing] = useState(false);
    const [nebbySpeech, setNebbySpeech] = useState(INITIAL_STATE.quotes.quietNebula[2]);
    const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
    const [tasksToTriage, setTasksToTriage] = useState<Task[] | null>(null);
    const [showVoid, setShowVoid] = useState(false);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            setIsApiKeyMissing(true);
        }
    }, []);

    // Persistence Effect: Save to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('nebby_view', JSON.stringify(view));
        localStorage.setItem('nebby_mode', JSON.stringify(mode));
        localStorage.setItem('nebby_fuel', JSON.stringify(fuelLevel));
        localStorage.setItem('nebby_tasks', JSON.stringify(tasks));
        localStorage.setItem('nebby_tab', JSON.stringify(activeTab));
        localStorage.setItem('nebby_completedStars', JSON.stringify(completedTasks));
        localStorage.setItem('nebby_streak', JSON.stringify(streak));
        localStorage.setItem('nebby_backlog', JSON.stringify(backlog));
        localStorage.setItem('nebby_logbook', JSON.stringify(logEntries));
        localStorage.setItem('nebby_void', JSON.stringify(voidTasks));
    }, [view, mode, fuelLevel, tasks, activeTab, completedTasks, streak, backlog, logEntries, voidTasks]);

    // Evaporation Protocol Logic
    useEffect(() => {
        const checkEvaporation = () => {
            const now = Date.now();
            const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
            
            setBacklog(currentBacklog => {
                const keep: Task[] = [];
                const evaporate: Task[] = [];
                let hasEvaporated = false;
                
                currentBacklog.forEach(task => {
                    const createdAt = task.createdAt || now;
                    const taskAge = now - createdAt;
                    
                    if (taskAge > THIRTY_DAYS) {
                        evaporate.push(task);
                        hasEvaporated = true;
                    } else {
                        keep.push(task);
                    }
                });

                if (hasEvaporated) {
                    setVoidTasks(prev => {
                        // Prevent duplicates in void if useEffect runs multiple times
                        const existingIds = new Set(prev.map(t => t.id));
                        const newEvaporated = evaporate.filter(t => !existingIds.has(t.id));
                        return [...prev, ...newEvaporated];
                    });
                    setTimeout(() => {
                         setNebbySpeech(`"Captain, I've moved stagnant cargo to the Void to conserve memory."`);
                    }, 2000);
                    return keep;
                }
                return currentBacklog;
            });
        };
        
        checkEvaporation();
    }, []); // Runs once on mount

    const getRandomQuote = useCallback((currentMode: Mode) => {
        const quoteList = INITIAL_STATE.quotes[currentMode];
        return quoteList[Math.floor(Math.random() * quoteList.length)];
    }, []);

    useEffect(() => {
        document.body.className = mode;
        // Don't overwrite speech if we are currently triaging or just loaded
        if (!tasksToTriage && !isSwallowing) {
             setNebbySpeech(`"${getRandomQuote(mode)}"`);
        }
    }, [mode, getRandomQuote, tasksToTriage, isSwallowing]);


    const handleFuelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFuel = parseInt(e.target.value, 10);
        setFuelLevel(newFuel);
        // Mode change happens visually, but setMode is called on Launch
        // We update body class immediately for feedback
        const previewMode = newFuel >= 50 ? Mode.Supernova : Mode.QuietNebula;
        document.body.className = previewMode;
    };

    const launchDashboard = () => {
        const newMode = fuelLevel >= 50 ? Mode.Supernova : Mode.QuietNebula;
        setMode(newMode);
        
        // Only increment streak if it wasn't already incremented today (simple logic: check if view was Scan)
        if (view === View.Scan) {
             setStreak(prev => prev + 1);
        }
        setView(View.Dashboard);
    };

    const handleSwallowChaos = async () => {
        if (!brainDump.trim() || isSwallowing || isApiKeyMissing) return;
        setIsSwallowing(true);
        try {
            const newTasks = await processBrainDump(brainDump);
            if (newTasks.length > 0) {
                setTasksToTriage(newTasks);
                setNebbySpeech(`"Captain, I've identified these potential objectives..."`);
            } else {
                 setNebbySpeech(`"I scanned that transmission, but found no actionable objectives."`);
            }
            setBrainDump('');
        } catch (error) {
            console.error("Error processing brain dump:", error);
            setNebbySpeech(`"Captain, there's some interference in the comms channel."`);
        } finally {
            setIsSwallowing(false);
        }
    };

    const handleExpeditionSwallow = async (expeditionDump: string, expedition: { id: number; title: string }) => {
        if (!expeditionDump.trim() || isApiKeyMissing) return;
        // This can use a separate loading state if needed
        try {
            const processedTasks = await processBrainDump(expeditionDump);
            const expeditionTasks = processedTasks.map(task => ({
                ...task,
                expeditionId: expedition.id,
                expeditionTitle: expedition.title,
            }));
            setBacklog(prev => [...expeditionTasks, ...prev]);
            setNebbySpeech(`"New objectives logged for Expedition ${expedition.title}."`);
        } catch (error) {
            console.error("Error processing expedition brain dump:", error);
            setNebbySpeech(`"Comms interference while plotting expedition course."`);
        }
    };


    const handleTriageComplete = (flightDeckTasks: Task[], cargoHoldTasks: Task[]) => {
        setTasks(prev => [...flightDeckTasks, ...prev]);
        setBacklog(prev => [...cargoHoldTasks, ...prev]);
        setTasksToTriage(null);
        setNebbySpeech(`"Assignments confirmed. Ready for your command."`);
    };
    
    const completeTask = (id: number) => {
        const taskToComplete = tasks.find(t => t.id === id);
        if (!taskToComplete) return;

        const newStar: CompletedTask = {
            id: taskToComplete.id,
            type: taskToComplete.type,
            x: Math.random() * 90 + 5,
            y: Math.random() * 90 + 5,
            expeditionId: taskToComplete.expeditionId,
            expeditionTitle: taskToComplete.expeditionTitle
        };
        setCompletedTasks(prev => [...prev, newStar]);

        setTimeout(() => {
            setTasks(prev => prev.filter(t => t.id !== id));
            setNebbySpeech(`"Mission accomplished! Another star in our map."`);
        }, 800);
    };

    const delegateTask = (id: number) => {
        const taskToDelegate = tasks.find(t => t.id === id);
        if (taskToDelegate) {
            setTasks(prev => prev.filter(t => t.id !== id));
            // Ensure delegated tasks have a createdAt timestamp if missing, to start the clock
            const taskWithTimestamp = { 
                ...taskToDelegate, 
                createdAt: taskToDelegate.createdAt || Date.now() 
            };
            setBacklog(prev => [taskWithTimestamp, ...prev]);
            setNebbySpeech(`"Task moved to Cargo Hold. We'll get to it later."`);
        }
    };

    const promoteTask = (id: number) => {
        const taskToPromote = backlog.find(t => t.id === id);
        if (taskToPromote) {
            setBacklog(prev => prev.filter(t => t.id !== id));
            // Keep expedition context when promoting to flight deck
            setTasks(prev => [...prev, taskToPromote]);
            setNebbySpeech(`"Objective retrieved from Cargo. It's back on the Flight Deck."`);
        }
    };

    const handleSaveLogEntry = (mood: number, text: string) => {
        const today = new Date().toISOString().split('T')[0];
        const todayEntryIndex = logEntries.findIndex(entry => entry.date === today);

        if (todayEntryIndex > -1) {
            // Update existing entry
            const updatedEntries = [...logEntries];
            const existingEntry = { ...updatedEntries[todayEntryIndex] };
            
            // Append text if provided
            if (text.trim()) {
                if (existingEntry.text) {
                    existingEntry.text += `\n\n${text}`;
                } else {
                    existingEntry.text = text;
                }
            }
            
            // Always update mood
            existingEntry.mood = mood;
            
            updatedEntries[todayEntryIndex] = existingEntry;
            setLogEntries(updatedEntries);
            setNebbySpeech(`"Log updated. Data saved to core memory."`);
        } else {
            // Create a new entry
            const newEntry: LogEntry = {
                id: `log-${Date.now()}`,
                date: today,
                mood,
                text
            };
            setLogEntries(prev => [newEntry, ...prev]);
            setNebbySpeech(`"Captain's log created. Acknowledging energy signature."`);
        }
    };

    const resetNavigator = () => {
        if (window.confirm("WARNING: This will wipe all current mission data and reset Nebby. Are you sure?")) {
            localStorage.clear();
            // We manually reload to ensure clean state from initial constants
            window.location.reload();
        }
    };

    const restoreFromVoid = (taskId: number) => {
        const taskToRestore = voidTasks.find(t => t.id === taskId);
        if (taskToRestore) {
            setVoidTasks(prev => prev.filter(t => t.id !== taskId));
            // Restore to backlog with refreshed timestamp
            setBacklog(prev => [{...taskToRestore, createdAt: Date.now()}, ...prev]);
            setNebbySpeech(`"Retrieving artifact from the Void... Success."`);
        }
    };

    if (tasksToTriage) {
        return <TriageView initialTasks={tasksToTriage} onComplete={handleTriageComplete} mode={mode} />;
    }

    if (view === View.Scan) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-950/90 backdrop-blur-2xl transition-all duration-700">
                <StarsBackground />
                <Nebby mode={fuelLevel >= 50 ? Mode.Supernova : Mode.QuietNebula} size="lg" />
                <h1 className="text-4xl font-bold mb-3 tracking-tight text-center">Life-Sign Scan</h1>
                <p className="text-slate-400 text-center mb-12 max-w-xs leading-relaxed">Good solar cycle, Captain. How are your fuel levels today?</p>

                <div className="w-full max-w-xs space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">
                            <span>Empty Battery</span>
                            <span>Full Supernova</span>
                        </div>
                        <input type="range" min="0" max="100" value={fuelLevel} onChange={handleFuelChange} className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <div className="glass p-6 rounded-3xl text-center">
                        <p className="text-lg font-medium text-purple-200">
                           {fuelLevel >= 50 ? `"High energy detected! We're ready for warp speed."` : `"Quiet Nebula mode engaged. Let's keep the life-support systems running."`}
                        </p>
                    </div>
                    <button onClick={launchDashboard} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/40 active:scale-95 transition-transform">
                        ENGAGE NAVIGATION
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-md mx-auto relative px-5 pt-4">
            <StarsBackground />
            
            <header className="relative flex flex-col items-center mb-2 shrink-0">
                 {/* Top Right Controls */}
                 <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                    <button 
                        onClick={() => setShowVoid(true)} 
                        title="The Void (Evaporated Logs)" 
                        className="w-8 h-8 glass rounded-full flex items-center justify-center text-slate-400 hover:text-red-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xs">cloud_off</span>
                    </button>
                    <button 
                        onClick={resetNavigator} 
                        title="Reset Session (Clear Data)" 
                        className="w-8 h-8 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xs">delete_forever</span>
                    </button>
                 </div>

                <Nebby mode={mode} size="sm" onClick={() => setNebbySpeech(`"${getRandomQuote(mode)}"`)} />
                
                <div className="glass px-4 py-3 rounded-2xl rounded-tr-none relative max-w-[95%] shadow-lg">
                    <p className="text-sm text-center font-medium italic leading-relaxed text-slate-200">{nebbySpeech}</p>
                </div>
                 <div className="w-full max-w-[95%] mt-2">
                    <div className="glass-card rounded-xl p-2 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-yellow-300 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">explore</span>
                            DISTANCE
                        </h3>
                        <p className="text-sm font-black tracking-widest">{(streak * 1.38).toFixed(2)} <span className="text-[10px] opacity-50">AU</span></p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-28">
                 {activeTab === Tab.Console && (
                    <ConsoleView
                        mode={mode}
                        setMode={setMode}
                        brainDump={brainDump}
                        setBrainDump={setBrainDump}
                        handleSwallowChaos={handleSwallowChaos}
                        isSwallowing={isSwallowing}
                        isApiKeyMissing={isApiKeyMissing}
                        protocols={INITIAL_STATE.protocols}
                        tasks={tasks}
                        completeTask={completeTask}
                        delegateTask={delegateTask}
                    />
                )}
                {activeTab === Tab.Expeditions && <ExpeditionsView backlog={backlog} onSwallow={handleExpeditionSwallow} isApiKeyMissing={isApiKeyMissing} />}
                {activeTab === Tab.Cargo && <CargoHoldView backlog={backlog} promoteTask={promoteTask} />}
                {activeTab === Tab.Logbook && <LogbookView entries={logEntries} onSave={handleSaveLogEntry} />}
                {activeTab === Tab.StarMap && <StarMapView completedTasks={completedTasks} />}
            </main>
            
            <BottomNav activeTab={activeTab} onTabClick={setActiveTab} />
            
            <VoidModal 
                isOpen={showVoid} 
                onClose={() => setShowVoid(false)} 
                voidTasks={voidTasks} 
                onRestore={restoreFromVoid} 
            />
        </div>
    );
};

export default App;
