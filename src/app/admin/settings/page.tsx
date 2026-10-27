import { getPlatformSettings } from "@/lib/services/settingsService";
import { PlatformSettingsForm } from "./PlatformSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          System Parameters
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Platform Settings & bKash Config</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Configure receiving bKash numbers, step-by-step instructions, attribution windows, and minimum payouts.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
        <PlatformSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
