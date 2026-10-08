import React from 'react';
import { Home, Youtube, Facebook, Instagram, Info } from 'lucide-react';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

export type ScreenTab = 'home' | 'youtube' | 'facebook' | 'instagram' | 'drive' | 'about';

interface BottomNavBarProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as ScreenTab, label: 'होम', icon: Home, isCustom: false, color: 'text-rose-400' },
    { id: 'youtube' as ScreenTab, label: 'यूट्यूब', icon: Youtube, isCustom: false, color: 'text-red-500' },
    { id: 'facebook' as ScreenTab, label: 'फेसबुक', icon: Facebook, isCustom: false, color: 'text-blue-500' },
    { id: 'instagram' as ScreenTab, label: 'इंस्टा', icon: Instagram, isCustom: false, color: 'text-pink-500' },
    { id: 'drive' as ScreenTab, label: 'ड्राइव', icon: GoogleDriveIcon, isCustom: true, color: 'text-amber-400' },
    { id: 'about' as ScreenTab, label: 'जानकारी', icon: Info, isCustom: false, color: 'text-emerald-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg shadow-2xl safe-area-pb">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-white scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-slate-800 shadow-md border border-slate-700/80'
                    : 'bg-transparent'
                }`}
              >
                {tab.isCustom ? (
                  <GoogleDriveIcon className="w-5 h-5" />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? tab.color : 'text-slate-400'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-white font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -top-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
