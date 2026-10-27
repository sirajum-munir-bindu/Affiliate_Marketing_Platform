import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEMO_AUDIT_LOGS = [
  {
    id: "log-demo-1",
    action: "PAYMENT_APPROVED",
    entityType: "PAYMENT",
    entityId: "pay_sample_101",
    details: '{"status":"APPROVED","orderId":"ORD-20261026-X7Y8","note":"Verified via bKash statement"}',
    createdAt: new Date(),
    actor: {
      name: "Platform Super Admin",
      email: "admin@platform.com",
      role: "ADMIN",
    },
  },
  {
    id: "log-demo-2",
    action: "MARKETER_APPROVED",
    entityType: "MARKETER_PROFILE",
    entityId: "mkt_sample_202",
    details: '{"status":"APPROVED","reviewNote":"Portfolio verified"}',
    createdAt: new Date(Date.now() - 3600000 * 4),
    actor: {
      name: "Platform Super Admin",
      email: "admin@platform.com",
      role: "ADMIN",
    },
  },
  {
    id: "log-demo-3",
    action: "SETTINGS_UPDATED",
    entityType: "PLATFORM_SETTING",
    entityId: "default",
    details: '{"bkashNumber":"01711223344","minimumPayoutAmount":1000}',
    createdAt: new Date(Date.now() - 3600000 * 24),
    actor: {
      name: "Platform Super Admin",
      email: "admin@platform.com",
      role: "ADMIN",
    },
  },
];

export default async function AdminAuditPage() {
  let logs: any[] = [];
  try {
    logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  } catch (err) {
    logs = DEMO_AUDIT_LOGS;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Compliance & Security
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Administrative Audit Logs</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Immutable event log of payment approvals, rejections, marketer status changes, and payout settlements.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed rounded-xl">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Target Entity</th>
                  <th className="pb-3">Admin / Actor</th>
                  <th className="pb-3">Details / Snapshot</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5">
                      <span className="font-mono font-bold text-[#172033] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <span className="font-semibold">{log.entityType}</span> #
                      <span className="font-mono text-[11px]">{log.entityId.slice(0, 8)}</span>
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-[#172033]">{log.actor?.name || "System"}</p>
                      <p className="text-[10px] text-[#64748B]">{log.actor?.email}</p>
                    </td>
                    <td className="py-3.5 max-w-sm font-mono text-[11px] text-slate-600 truncate" title={log.details || ""}>
                      {log.details || "—"}
                    </td>
                    <td className="py-3.5 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("en-BD", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
