import { Lock } from 'lucide-react';

export function DashboardLockOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="max-w-md space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                    <Lock className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Locked</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Access to the live pricing dashboard is temporarily restricted by the administrator.
                        Please check back later or contact support if you believe this is an error.
                    </p>
                </div>
                <div className="pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        System Maintenance Mode
                    </div>
                </div>
            </div>
        </div>
    );
}
