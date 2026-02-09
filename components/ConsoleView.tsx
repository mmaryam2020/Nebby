
import React, { useMemo } from 'react';
import { Mode, Task } from '../types';
import { ModeToggle } from './ModeToggle';
import { ProtocolCard } from './ProtocolCard';
import { TaskCard } from './TaskCard';
import { VoiceInputButton } from './VoiceInputButton';

interface ConsoleViewProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    brainDump: string;
    setBrainDump: React.Dispatch<React.SetStateAction<string>>;
    handleSwallowChaos: () => void;
    isSwallowing: boolean;
    isApiKeyMissing: boolean;
    protocols: {
        morning: { quietNebula: string[], supernova: string[] };
        evening: { quietNebula: string[], supernova: string[] };
    };
    tasks: Task[];
    completeTask: (id: number) => void;
    delegateTask: (id: number) => void;
}

export const ConsoleView: React.FC<ConsoleViewProps> = (props) => {
    const { mode, setMode, brainDump, setBrainDump, handleSwallowChaos, isSwallowing, isApiKeyMissing, protocols, tasks, completeTask, delegateTask } = props;

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => mode === Mode.Supernova || t.type === 'quietNebula');
    }, [tasks, mode]);
    
    return (
        <div className="space-y-6 stardust-entry">
            <ModeToggle mode={mode} setMode={setMode} />
            
            <section className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-purple-400 text-base">blur_on</span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">The Black Hole</h2>
                </div>
                <div className={`glass rounded-[1.5rem] p-4 transition-transform duration-500`}>
                    <textarea
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder-slate-600 resize-none min-h-[60px]"
                        placeholder="Throw your mental chaos in here..."
                        value={brainDump}
                        onChange={(e) => setBrainDump(e.target.value)}
                        disabled={isSwallowing}
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                        <VoiceInputButton 
                            onTranscript={(text) => setBrainDump(prev => prev ? prev + ' ' + text : text)} 
                        />
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-300 disabled:opacity-50"
                            onClick={handleSwallowChaos}
                            disabled={isSwallowing || !brainDump.trim() || isApiKeyMissing}
                        >
                            <span className="material-symbols-outlined text-base">cyclone</span>
                            {isSwallowing ? 'Processing...' : 'Swallow'}
                        </button>
                    </div>
                    {isApiKeyMissing && <p className="text-red-400 text-[10px] text-center pt-1">API key not found.</p>}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-purple-400 text-base">checklist</span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">System Protocols</h2>
                </div>
                <ProtocolCard title="Morning Pulse" icon="light_mode" color="blue" items={protocols.morning[mode]} />
                <ProtocolCard title="Evening Shutdown" icon="bedtime" color="indigo" items={protocols.evening[mode]} />
            </section>
            
            <section className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400 text-base">radar</span>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Flight Deck</h2>
                    </div>
                    <span className="text-[9px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-widest">
                       {filteredTasks.length} Alerts
                    </span>
                </div>
                <div className="space-y-2.5">
                    {filteredTasks.length === 0 ? (
                       <div className="text-center py-6 opacity-40 text-[10px] uppercase tracking-widest">Sector Clear</div>
                    ) : (
                        filteredTasks.map(task => <TaskCard key={task.id} task={task} onComplete={completeTask} onDelegate={delegateTask} />)
                    )}
                </div>
            </section>
        </div>
    );
};
