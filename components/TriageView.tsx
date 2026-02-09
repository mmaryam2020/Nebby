
import React, { useState, useEffect } from 'react';
import { Task, Mode } from '../types';
import { StarsBackground } from './StarsBackground';

interface TriageViewProps {
    initialTasks: Task[];
    onComplete: (flightDeckTasks: Task[], cargoHoldTasks: Task[]) => void;
    mode: Mode;
}

const EnergySelector: React.FC<{ level: number; onChange: (newLevel: number) => void }> = ({ level, onChange }) => (
    <div className="flex items-center gap-2" title={`Calibrate Thruster Output`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <button
                key={i}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(i + 1);
                }}
                className={`w-4 h-4 rounded-full transition-colors ${i < level ? 'bg-yellow-400' : 'bg-white/10 hover:bg-white/20'}`}
            ></button>
        ))}
    </div>
);


const TriageListItem: React.FC<{
    task: Task;
    onMove: () => void;
    onEnergyChange: (newLevel: number) => void;
    destination: 'cargoHold' | 'flightDeck';
}> = ({ task, onMove, onEnergyChange, destination }) => {
    const isMovingToCargo = destination === 'cargoHold';
    const icon = isMovingToCargo ? 'move_down' : 'north_east';
    const title = isMovingToCargo ? 'Move to Cargo Hold' : 'Move to Flight Deck';
    
    return (
        <div className="glass-card p-3 rounded-2xl flex flex-col gap-3 stardust-entry">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <span className={`material-symbols-outlined text-lg ${task.type === 'quietNebula' ? 'text-purple-400' : 'text-yellow-400'} shrink-0`}>
                        {task.type === 'quietNebula' ? 'shield' : 'rocket_launch'}
                    </span>
                    <p className="text-sm font-medium text-slate-200 truncate">{task.text}</p>
                </div>
                <button
                    onClick={onMove}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 bg-white/5 hover:bg-white/10 transition-colors shrink-0 ml-2"
                    title={title}
                >
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                </button>
            </div>
             <div className="pl-9">
                <EnergySelector level={task.energyLevel ?? 3} onChange={onEnergyChange} />
             </div>
        </div>
    );
};


export const TriageView: React.FC<TriageViewProps> = ({ initialTasks, onComplete, mode }) => {
    const [flightDeckTasks, setFlightDeckTasks] = useState<Task[]>([]);
    const [cargoHoldTasks, setCargoHoldTasks] = useState<Task[]>([]);

    useEffect(() => {
        const suggestedFlightDeck: Task[] = [];
        const suggestedCargoHold: Task[] = [];

        if (mode === Mode.QuietNebula) {
            initialTasks.forEach(task => {
                if (task.type === 'quietNebula') {
                    suggestedFlightDeck.push(task);
                } else {
                    suggestedCargoHold.push(task);
                }
            });
        } else { // Supernova Mode
            initialTasks.forEach(task => {
                suggestedFlightDeck.push(task);
            });
        }
        
        setFlightDeckTasks(suggestedFlightDeck);
        setCargoHoldTasks(suggestedCargoHold);
    }, [initialTasks, mode]);

    const moveTaskToCargo = (taskToMove: Task) => {
        setFlightDeckTasks(prev => prev.filter(t => t.id !== taskToMove.id));
        setCargoHoldTasks(prev => [taskToMove, ...prev]);
    };

    const moveTaskToFlightDeck = (taskToMove: Task) => {
        setCargoHoldTasks(prev => prev.filter(t => t.id !== taskToMove.id));
        setFlightDeckTasks(prev => [taskToMove, ...prev]);
    };

    const updateTaskEnergy = (taskId: number, newLevel: number) => {
        const updater = (tasks: Task[]) => tasks.map(t => t.id === taskId ? { ...t, energyLevel: newLevel } : t);
        setFlightDeckTasks(updater);
        setCargoHoldTasks(updater);
    };

    const handleConfirm = () => {
        onComplete(flightDeckTasks, cargoHoldTasks);
    };
    
    const suggestionText = mode === Mode.QuietNebula
        ? "Fuel is low. I've prioritized essential tasks and stored the rest."
        : "All systems go! I've plotted all objectives for the Flight Deck.";

    return (
        <div className="fixed inset-0 z-50 flex flex-col p-5 pt-8 bg-slate-950/90 backdrop-blur-2xl triage-enter">
            <StarsBackground />
            <header className="text-center mb-6 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">Triage Suggestions</h1>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">{suggestionText}</p>
            </header>
            
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-6 max-w-md mx-auto w-full">
                 <section>
                    <div className="flex items-center gap-2 px-1 mb-3">
                        <span className="material-symbols-outlined text-purple-400 text-lg">radar</span>
                        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-300">Suggested for Flight Deck</h2>
                    </div>
                    <div className="space-y-2">
                        {flightDeckTasks.length > 0 ? (
                            flightDeckTasks.map(task => (
                                <TriageListItem 
                                    key={task.id} 
                                    task={task} 
                                    onMove={() => moveTaskToCargo(task)} 
                                    onEnergyChange={(newLevel) => updateTaskEnergy(task.id, newLevel)}
                                    destination="cargoHold" 
                                />
                            ))
                        ) : (
                            <div className="text-center text-xs text-slate-500 py-4 opacity-50">No tasks suggested for the Flight Deck.</div>
                        )}
                    </div>
                 </section>

                 <section>
                    <div className="flex items-center gap-2 px-1 mb-3">
                        <span className="material-symbols-outlined text-slate-500 text-lg">inventory_2</span>
                        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Suggested for Cargo Hold</h2>
                    </div>
                    <div className="space-y-2">
                        {cargoHoldTasks.length > 0 ? (
                            cargoHoldTasks.map(task => (
                                <TriageListItem 
                                    key={task.id} 
                                    task={task} 
                                    onMove={() => moveTaskToFlightDeck(task)} 
                                    onEnergyChange={(newLevel) => updateTaskEnergy(task.id, newLevel)}
                                    destination="flightDeck" 
                                />
                            ))
                        ) : (
                             <div className="text-center text-xs text-slate-500 py-4 opacity-50">Cargo Hold suggestions are empty.</div>
                        )}
                    </div>
                 </section>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 to-transparent z-10">
                <button 
                    onClick={handleConfirm}
                    className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/40 active:scale-95 transition-transform"
                >
                    CONFIRM ASSIGNMENTS
                </button>
            </footer>
        </div>
    );
};