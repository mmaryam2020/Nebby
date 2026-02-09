
import React from 'react';
import { Mode } from '../types';

interface NebbyProps {
    mode: Mode;
    onClick?: () => void;
    size?: 'lg' | 'sm';
}

export const Nebby: React.FC<NebbyProps> = ({ onClick, size = 'lg' }) => {
    return (
        <div 
            className={`nebby-container mb-2 cursor-pointer ${size === 'sm' ? 'compact' : ''}`} 
            onClick={onClick}
        >
            <div className="nebby-body"></div>
            <div className="nebby-face">
                <div className="nebby-eye"></div>
                <div className="nebby-eye"></div>
            </div>
        </div>
    );
};
