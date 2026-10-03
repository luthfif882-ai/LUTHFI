import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MessageSquare, Send, Trash2, Heart, Sparkles } from 'lucide-react';

export const WallPage: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const { wallMessages, addWallMessage, deleteWallMessage } = useData();

  const [messageInput, setMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      setSubmitting(true);
      await addWallMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <MessageSquare className="w-7 h-7 text-teal-600" />
          <span>Pesan & Kesan SPI 1A</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Dinding aspirasi, kesan perkuliahan, dan kata-kata motivasi untuk kawan sekelas
        </p>
      </div>

      {/* Write Message Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-800">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Tuliskan pesan & kesan Anda:</span>
          </div>

          <textarea
            rows={3}
            required
            placeholder="Tuliskan pengalaman kuliah, pesan semangat, atau salam persaudaraan..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400">
              Dikirim sebagai: <strong>{userProfile?.name || 'Mahasiswa SPI 1A'}</strong>
            </span>

            <button
              type="submit"
              disabled={submitting || !messageInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Mengirim...' : 'Kirim ke Dinding'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Wall Message Cards Masonry Grid */}
      {wallMessages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallMessages.map((msg, idx) => {
            const isAuthor = msg.senderUid === userProfile?.uid;
            const canDelete = isAuthor || isAdmin;

            // Palette variation for pleasant sticky note look
            const bgThemes = [
              'bg-amber-50/70 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/40',
              'bg-emerald-50/70 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40',
              'bg-teal-50/70 border-teal-200/80 dark:bg-teal-950/20 dark:border-teal-900/40',
              'bg-stone-50/90 border-stone-200 dark:bg-stone-800/60 dark:border-stone-700/60'
            ];
            const themeClass = bgThemes[idx % bgThemes.length];

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-all hover:scale-[1.01] ${themeClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-serif-title text-stone-900 dark:text-stone-100">
                      {msg.senderName} {isAuthor && <span className="text-emerald-700 dark:text-emerald-400 font-sans text-[10px]">(Anda)</span>}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between border-t border-stone-200/40 dark:border-stone-700/40">
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    <span>SPI 1A Angkatan 2026</span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => deleteWallMessage(msg.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                      title="Hapus pesan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
          <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            Dinding pesan masih kosong
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Jadilah yang pertama menuliskan pesan semangat atau kesan untuk kelas SPI 1A!
          </p>
        </div>
      )}
    </div>
  );
};
