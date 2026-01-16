"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useUserProgress } from "@/store/use-user-progress";
import { MessageSquare, Send } from "lucide-react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
    const { userId, userName } = useUserProgress();
    const [message, setMessage] = useState("");
    const [type, setType] = useState("saran");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    userName: userName || "User",
                    message,
                    type,
                }),
            });

            if (res.ok) {
                toast.success("Terima kasih! Masukan Anda telah terkirim.");
                setMessage("");
                onClose();
            } else {
                toast.error("Gagal mengirim masukan. Coba lagi nanti.");
            }
        } catch (error) {
            console.error("Feedback error:", error);
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                        <MessageSquare className="h-6 w-6" />
                        Kotak Saran & Kritik
                    </DialogTitle>
                    <DialogDescription>
                        Bantu kami membuat Cendra Lingo lebih baik! Kami sangat menghargai setiap masukan Anda.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Jenis Masukan</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="saran">💡 Saran / Ide Fitur</SelectItem>
                                <SelectItem value="kritik">🐞 Lapor Bug / Kritik</SelectItem>
                                <SelectItem value="other">💬 Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Pesan Anda</Label>
                        <Textarea
                            placeholder="Tulis masukan Anda di sini..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSubmitting ? "Mengirim..." : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Kirim Masukan
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
