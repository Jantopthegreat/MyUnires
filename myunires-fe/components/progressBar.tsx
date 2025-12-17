function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${v}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-gray-500">{v.toFixed(0)}%</p>
    </div>
  );
}

function TargetProgressTable({
  rows,
  loading,
}: {
  rows: import("@/lib/api").TargetProgressRow[];
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="px-6 py-5 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Progress Tahfidz per Target</h3>
        <p className="text-xs text-gray-500">Selesai vs belum selesai</p>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Selesai</th>
              <th className="px-6 py-3">Belum</th>
              <th className="px-6 py-3 w-[260px]">Progress</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-xs text-gray-500" colSpan={5}>
                  Memuat data...
                </td>
              </tr>
            ) : null}

            {!loading &&
              rows.map((r) => {
                const total = r.selesai + r.belum;
                const pct = total > 0 ? (r.selesai / total) * 100 : 0;

                return (
                  <tr key={r.targetId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.nama}</p>
                      <p className="text-xs text-gray-500">
                        {r.surah} ({r.ayatMulai}–{r.ayatAkhir})
                      </p>
                    </td>

                    <td className="px-6 py-4 font-medium text-emerald-700 tabular-nums">
                      {r.selesai}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-700 tabular-nums">
                      {r.belum}
                    </td>

                    <td className="px-6 py-4">
                      <ProgressBar value={pct} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/admin/tahfidz/target/${r.targetId}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Detail
                      </a>
                    </td>
                  </tr>
                );
              })}

            {!loading && !rows.length ? (
              <tr>
                <td className="px-6 py-6 text-xs text-gray-500" colSpan={5}>
                  Belum ada data progress.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
