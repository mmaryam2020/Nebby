
import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onTabClick: (tab: Tab) => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
        <span className="text-[9px] font-bold tracking-wider uppercase">{label}</span>
    </button>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabClick }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10">
            <div className="max-w-md mx-auto p-4">
                <div className="glass rounded-full flex justify-around items-center py-3 px-2 shadow-2xl border-white/20">
                    <NavItem icon="space_dashboard" label="Console" isActive={activeTab === Tab.Console} onClick={() => onTabClick(Tab.Console)} />
                    <NavItem icon="rocket" label="Expeditions" isActive={activeTab === Tab.Expeditions} onClick={() => onTabClick(Tab.Expeditions)} />
                    <NavItem icon="inventory_2" label="Cargo" isActive={activeTab === Tab.Cargo} onClick={() => onTabClick(Tab.Cargo)} />
                    <NavItem icon="auto_stories" label="Logbook" isActive={activeTab === Tab.Logbook} onClick={() => onTabClick(Tab.Logbook)} />
                    <NavItem icon="stars" label="Star Map" isActive={activeTab === Tab.StarMap} onClick={() => onTabClick(Tab.StarMap)} />
                </div>
            </div>
        </footer>
    );
};
