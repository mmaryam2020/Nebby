
import React from 'react';
import { Task } from '../types';

interface VoidModalProps {
    isOpen: boolean;
    onClose: () => void;
    voidTasks: Task[];
    onRestore: (taskId: number) => void;
}

export const VoidModal: React.FC<VoidModalProps> = ({ isOpen, onClose, voidTasks, onRestore }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 border-slate-700 shadow-2xl animate-fade-in-up max-h-[80vh] flex flex-col">
                <div className="text-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">cloud_off</span>
                    <h2 className="text-xl font-bold text-slate-300 uppercase tracking-widest">The Void</h2>
                    <p className="text-xs text-slate-500 mt-1">Tasks lost to the ether (30+ days inactive).</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar min-h-[200px]">
                    {voidTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                            <span className="text-sm italic">The void is silent.</span>
                        </div>
                    ) : (
                        voidTasks.map(task => (
                            <div key={task.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group">
                                <div className="min-w-0 flex-1 pr-3">
                                    <p className="text-sm text-slate-400 opacity-70 truncate decoration-slate-600 line-through decoration-wavy decoration-1">{task.text}</p>
                                    <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                                        Evaporated: {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => onRestore(task.id)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-green-500/20 hover:text-green-300 text-slate-600 transition-all shrink-0"
                                    title="Restore from Void"
                                >
                                    <span className="material-symbols-outlined text-lg">restore_from_trash</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors"
                >
                    Close Portal
                </button>
            </div>
        </div>
    );
};
