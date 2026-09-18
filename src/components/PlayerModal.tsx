import React, { useState } from 'react';
import { X, Users, Check, Plus, Trash2, Edit3 } from 'lucide-react';
import { Player } from '../types';
import { soundManager } from '../utils/audio';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSavePlayers: (updatedPlayers: Player[]) => void;
}

const PLAYER_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  players,
  onSavePlayers,
}) => {
  const [playerList, setPlayerList] = useState<Player[]>(players);
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  if (!isOpen) return null;

  const handleNameChange = (id: string, name: string) => {
    setPlayerList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleColorChange = (id: string, color: string) => {
    setPlayerList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, color } : p))
    );
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      currentScore: 0,
      frameWins: 0,
      currentBreak: 0,
      highestBreakInFrame: 0,
      matchHighestBreak: 0,
      potsCount: 0,
      missesCount: 0,
      foulsCount: 0,
      color: PLAYER_COLORS[playerList.length % PLAYER_COLORS.length],
    };
    setPlayerList([...playerList, newPlayer]);
    setNewPlayerName('');
    soundManager.playClickSound();
  };

  const handleRemovePlayer = (id: string) => {
    if (playerList.length <= 2) {
      alert('حداقل ۲ بازیکن برای مسابقه اسنوکر الزامی است.');
      return;
    }
    setPlayerList((prev) => prev.filter((p) => p.id !== id));
    soundManager.playClickSound();
  };

  const handleSave = () => {
    soundManager.playClickSound();
    onSavePlayers(playerList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">مدیریت بازیکنان مسابقه</h3>
              <p className="text-xs text-slate-400">تغییر نام، رنگ و افزودن بازیکن جدید</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Players List */}
        <div className="space-y-3 my-4 max-h-[55vh] overflow-y-auto pr-1">
          {playerList.map((player, idx) => (
            <div
              key={player.id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold w-6">#{idx + 1}</span>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="نام بازیکن..."
                />
                {playerList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="حذف بازیکن"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-1.5 mr-8">
                <span className="text-[11px] text-slate-400 ml-2">رنگ شناسه:</span>
                {PLAYER_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleColorChange(player.id, col)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      player.color === col ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Add New Player */}
          {playerList.length < 4 && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddPlayer();
                }}
                placeholder="نام بازیکن جدید..."
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره تغییرات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
