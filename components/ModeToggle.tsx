
import React from 'react';
import { Mode } from '../types';

interface ModeToggleProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, setMode }) => {
    const isQuietNebula = mode === Mode.QuietNebula;
    const quietNebulaClasses = isQuietNebula
        ? 'bg-purple-500 text-white'
        : 'text-slate-400';
    const supernovaClasses = !isQuietNebula
        ? 'bg-yellow-500 text-slate-900'
        : 'text-slate-400';

    return (
        <div className="flex justify-center mb-6 shrink-0">
            <div className="glass p-1 rounded-full flex gap-1">
                <button
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${quietNebulaClasses}`}
                    onClick={() => setMode(Mode.QuietNebula)}
                >
                    QUIET NEBULA
                </button>
                <button
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${supernovaClasses}`}
                    onClick={() => setMode(Mode.Supernova)}
                >
                    SUPERNOVA
                </button>
            </div>
        </div>
    );
};