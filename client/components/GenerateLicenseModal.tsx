import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlanType } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateLicenseKey } from "@/lib/licenses";

interface GenerateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUid: string;
  onLicenseGenerated: () => void;
}

const DURATION_PRESETS = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "1 an", days: 365 },
];

export function GenerateLicenseModal({
  isOpen,
  onClose,
  adminUid,
  onLicenseGenerated,
}: GenerateLicenseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Classic");
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedDays) {
      toast.error("Sélectionnez une durée");
      return;
    }

    setLoading(true);
    try {
      const newKey = await generateLicenseKey(
        selectedPlan,
        adminUid,
        selectedDays,
      );
      toast.success(`Clé générée: ${newKey}`);
      onLicenseGenerated();
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la génération de la clé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-gray-800 rounded-lg p-0 bg-black shadow-xl max-w-md">
        <DialogTitle className="sr-only">Générer une clé de licence</DialogTitle>
        
        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Générer une clé
            </h2>
            <p className="text-sm text-gray-400">
              Sélectionnez un plan et une durée
            </p>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">
              Plan
            </label>
            <div className="grid gap-2">
              {(["Free", "Classic", "Pro"] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === plan
                      ? "border-white bg-white/10 text-white"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <span className="font-semibold">
                    {plan}
                  </span>
                  <span className="text-xs block mt-1">
                    {plan === "Free" && "10 messages"}
                    {plan === "Classic" && "500 messages/jour"}
                    {plan === "Pro" && "1000 messages/jour"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">
              Validité
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setSelectedDays(preset.days)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    selectedDays === preset.days
                      ? "border-white bg-white/10 text-white"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-900 hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Génération...
                </>
              ) : (
                "Générer"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
