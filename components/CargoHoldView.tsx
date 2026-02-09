
import React from 'react';
import { Task } from '../types';

interface CargoHoldViewProps {
    backlog: Task[];
    promoteTask: (id: number) => void;
}

const EnergyDisplay: React.FC<{ level?: number }> = ({ level }) => {
    if (level === undefined) return null;
    return (
        <div className="flex items-center gap-1" title={`Thruster Output: ${level}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < level ? 'bg-slate-500' : 'bg-white/10'}`}
                ></div>
            ))}
        </div>
    );
};

const BacklogItem: React.FC<{ task: Task; onPromote: (id: number) => void }> = ({ task, onPromote }) => {
    const icon = task.type === 'quietNebula' ? 'shield' : 'rocket_launch';
    return (
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between stardust-entry">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate">{task.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {task.expeditionTitle && (
                             <span className="text-[9px] font-bold bg-cyan-400/10 text-cyan-300 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                                {task.expeditionTitle}
                            </span>
                        )}
                        <EnergyDisplay level={task.energyLevel} />
                    </div>
                </div>
            </div>
            <button
                onClick={() => onPromote(task.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-purple-400 bg-white/5 hover:bg-white/10 transition-colors shrink-0 ml-2"
                title="Promote to Flight Deck"
            >
                <span className="material-symbols-outlined text-lg">north_east</span>
            </button>
        </div>
    );
};

export const CargoHoldView: React.FC<CargoHoldViewProps> = ({ backlog, promoteTask }) => {
    return (
        <div className="stardust-entry space-y-4">
            <div className="text-center">
                 <h1 className="text-xl font-bold tracking-tight">Cargo Hold</h1>
                 <p className="text-xs text-slate-400">Tasks in stasis, ready for future missions.</p>
            </div>
            <div className="space-y-2">
                {backlog.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                        <p className="text-xs uppercase tracking-widest mt-2">Cargo Hold is Empty</p>
                    </div>
                ) : (
                    backlog.map(task => (
                        <BacklogItem key={task.id} task={task} onPromote={promoteTask} />
                    ))
                )}
            </div>
        </div>
    );
};
