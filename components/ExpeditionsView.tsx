
import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { VoiceInputButton } from './VoiceInputButton';

interface ExpeditionsViewProps {
    backlog: Task[];
    onSwallow: (dump: string, expedition: { id: number, title: string }) => Promise<void>;
    isApiKeyMissing: boolean;
}

interface ExpeditionGroup {
    id: number;
    title: string;
    tasks: Task[];
}

const EnergyDisplay: React.FC<{ level?: number }> = ({ level }) => {
    if (level === undefined) return null;
    return (
        <div className="flex items-center gap-1" title={`Thruster Output: ${level}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < level ? 'bg-cyan-400' : 'bg-white/10'}`}
                ></div>
            ))}
        </div>
    );
};

const AddToExpeditionForm: React.FC<{
    expeditions: ExpeditionGroup[];
    onSwallow: ExpeditionsViewProps['onSwallow'];
    isApiKeyMissing: boolean;
}> = ({ expeditions, onSwallow, isApiKeyMissing }) => {
    const [selectedExpeditionTitle, setSelectedExpeditionTitle] = useState('');
    const [newExpeditionTitle, setNewExpeditionTitle] = useState('');
    const [brainDump, setBrainDump] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const targetTitle = newExpeditionTitle || selectedExpeditionTitle;

    const handleSubmit = async () => {
        if (!targetTitle.trim() || !brainDump.trim() || isProcessing) return;

        let targetExpedition = expeditions.find(e => e.title === targetTitle);
        if (!targetExpedition) {
            targetExpedition = { id: Date.now(), title: targetTitle, tasks: [] };
        }
        
        setIsProcessing(true);
        await onSwallow(brainDump, targetExpedition);
        setIsProcessing(false);

        // Reset form
        setBrainDump('');
        setNewExpeditionTitle('');
        setSelectedExpeditionTitle('');
    };

    return (
        <section className="glass-card rounded-2xl p-4 border-l-2 border-l-green-400">
            <h2 className="text-xs font-bold text-green-300 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-base">add_circle</span>
                LOG NEW OBJECTIVES
            </h2>
            <div className="space-y-3">
                <input
                    type="text"
                    list="expedition-titles"
                    placeholder="Type new or select existing expedition"
                    value={targetTitle}
                    onChange={(e) => {
                        setSelectedExpeditionTitle(e.target.value);
                        setNewExpeditionTitle(e.target.value);
                    }}
                    className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs border border-white/10 focus:ring-green-400 focus:border-green-400"
                />
                <datalist id="expedition-titles">
                    {expeditions.map(e => <option key={e.id} value={e.title} />)}
                </datalist>

                <textarea
                    className="w-full bg-white/5 rounded-lg px-3 py-2 text-xs placeholder-slate-500 resize-none border border-white/10 focus:ring-green-400 focus:border-green-400"
                    placeholder="Brain dump tasks for this expedition..."
                    value={brainDump}
                    onChange={(e) => setBrainDump(e.target.value)}
                    disabled={isProcessing}
                    rows={2}
                />
                 <div className="flex justify-between items-center">
                    <VoiceInputButton 
                         onTranscript={(text) => setBrainDump(prev => prev ? prev + ' ' + text : text)} 
                    />
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-green-300 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isProcessing || !brainDump.trim() || !targetTitle.trim() || isApiKeyMissing}
                    >
                        <span className="material-symbols-outlined text-base">cyclone</span>
                        {isProcessing ? 'Logging...' : 'Log Objectives'}
                    </button>
                </div>
                 {isApiKeyMissing && <p className="text-red-400 text-[10px] text-center pt-1">API key not found.</p>}
            </div>
        </section>
    );
};

export const ExpeditionsView: React.FC<ExpeditionsViewProps> = ({ backlog, onSwallow, isApiKeyMissing }) => {
    const expeditions = useMemo(() => {
        const groups: Map<number, ExpeditionGroup> = new Map();
        backlog.forEach(task => {
            if (task.expeditionId && task.expeditionTitle) {
                if (!groups.has(task.expeditionId)) {
                    groups.set(task.expeditionId, {
                        id: task.expeditionId,
                        title: task.expeditionTitle,
                        tasks: []
                    });
                }
                groups.get(task.expeditionId)?.tasks.push(task);
            }
        });
        return Array.from(groups.values());
    }, [backlog]);

    return (
        <div className="stardust-entry space-y-4">
            <div className="text-center">
                 <h1 className="text-xl font-bold tracking-tight">Active Expeditions</h1>
                 <p className="text-xs text-slate-400">Long-term missions stored in the Cargo Hold.</p>
            </div>

            <AddToExpeditionForm expeditions={expeditions} onSwallow={onSwallow} isApiKeyMissing={isApiKeyMissing} />
            
            {expeditions.length > 0 ? expeditions.map(exp => (
                <div key={exp.id} className="glass-card rounded-2xl p-4 border-l-2 border-l-cyan-400">
                    <h2 className="font-bold text-sm text-cyan-200">{exp.title}</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-3">{`(${exp.tasks.length} objectives in stasis)`}</p>
                    <div className="space-y-2.5">
                        {exp.tasks.map(task => (
                            <div key={task.id} className="flex items-start justify-between gap-2 text-xs text-slate-300">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm text-cyan-400/70 mt-0.5">{task.type === 'supernova' ? 'rocket_launch' : 'shield'}</span>
                                    <span>{task.text}</span>
                                </div>
                                <EnergyDisplay level={task.energyLevel} />
                            </div>
                        ))}
                    </div>
                </div>
            )) : (
                 <div className="text-center py-10 opacity-40">
                    <span className="material-symbols-outlined text-4xl">rocket</span>
                    <p className="text-xs uppercase tracking-widest mt-2">No active expeditions</p>
                </div>
            )}
        </div>
    );
};
