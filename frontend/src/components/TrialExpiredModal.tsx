import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getFingerprint } from '@/lib/fingerprint';
import { API_BASE_URL } from '@/lib/api';
import { Lock, Rocket, CheckCircle2, QrCode } from 'lucide-react';

interface TrialExpiredModalProps {
    type: 'INITIAL' | 'EXTENDED';
    onClose?: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ type, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fingerprint = getFingerprint();
            const res = await fetch(`${API_BASE_URL}/trial/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint, name, email })
            });

            if (res.ok) {
                setSuccess(true);
                toast.success('Your trial has been extended by 3 days!');
                setTimeout(() => {
                    window.location.reload(); // Refresh to clear 402 states
                }, 2000);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to extend trial');
            }
        } catch (err) {
            toast.error('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <div className="w-full max-w-lg bg-[#0e1420] border border-[#ab8c56]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(171,140,86,0.2)]">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-[#ab8c56]/20 to-transparent p-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-[#ab8c56]/10 rounded-2xl border border-[#ab8c56]/20">
                            <Lock className="w-6 h-6 text-[#ab8c56]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                            Trial Expired
                        </h2>
                    </div>
                    <p className="text-blue-100/60 text-lg">
                        {type === 'INITIAL'
                            ? "Your 7-day initial trial has concluded. Join the GoldSync community to keep going!"
                            : "Your extended trial has ended. Please contact sales for continued access."}
                    </p>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 border border-success/30">
                                <CheckCircle2 className="w-10 h-10 text-success" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                            <p className="text-blue-100/60">Your access has been restored. Preparing your dashboard...</p>
                        </div>
                    ) : type === 'INITIAL' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* QR CODE SECTION */}
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <div className="bg-white p-3 rounded-xl mb-4 group hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://goldsync.live/signup?ref=${getFingerprint()}`}
                                        alt="Scan to Signup"
                                        className="w-32 h-32"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-[#ab8c56] font-semibold mb-1">
                                    <QrCode className="w-4 h-4" />
                                    <span>SCAN & SIGNUP</span>
                                </div>
                                <p className="text-[10px] text-blue-100/40 uppercase tracking-widest">
                                    Unlock 3 Additional Days
                                </p>
                            </div>

                            {/* FORM SECTION */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-blue-100/60 uppercase text-[10px] tracking-[0.2em]">Full Name</Label>
                                    <Input
                                        required
                                        placeholder="Enter your name"
                                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#ab8c56] focus:border-[#ab8c56]"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-blue-100/60 uppercase text-[10px] tracking-[0.2em]">Email / Mobile</Label>
                                    <Input
                                        required
                                        placeholder="your@email.com"
                                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#ab8c56] focus:border-[#ab8c56]"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <Button
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-[#ab8c56] to-[#8d7142] hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(171,140,86,0.3)]"
                                >
                                    {loading ? "Processing..." : (
                                        <div className="flex items-center gap-2">
                                            <Rocket className="w-5 h-5" />
                                            <span>Restore Access</span>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#ab8c56]/10 text-[#ab8c56] border border-[#ab8c56]/30 rounded-full font-bold uppercase tracking-widest mb-6">
                                Final Trial Expired
                            </div>
                            <p className="text-blue-100/40 mb-8 mx-auto max-w-xs">
                                Thank you for trying GoldSync. Your premium trial period has finished.
                            </p>
                            <Button
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest border border-white/10"
                                onClick={() => window.open('https://wa.me/yourwhatsappnumber', '_blank')}
                            >
                                Contact Support
                            </Button>
                        </div>
                    )}
                </div>

                <div className="bg-white/[0.02] p-4 text-center border-t border-white/5">
                    <p className="text-[10px] text-blue-100/20 uppercase tracking-[0.3em]">
                        Device ID: {getFingerprint().substring(0, 8)}...
                    </p>
                </div>
            </div>
        </div>
    );
};
