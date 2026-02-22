import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
    const { login } = useAuth();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        try {
            const success = await login(password);
            if (success) {
                toast.success("Access granted");
                onSuccess();
                setPassword("");
                onOpenChange(false);
            } else {
                setError(true);
                toast.error("Incorrect password");
                // Shake animation logic would go here via class/state
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">Admin Access Required</DialogTitle>
                    <DialogDescription className="text-center">
                        Please enter the administration password to modify margin settings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(false);
                            }}
                            className={`text-center tracking-widest ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            autoFocus
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Unlock Settings"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
