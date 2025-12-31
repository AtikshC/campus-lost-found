"use client";

import { useEffect, useState } from "react";

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Moderation</h2>

      <div className="space-y-2">
        {reports.map((r) => (
          <div key={r.id} className="border rounded p-3">
            <div className="text-xs text-neutral-600">
              {new Date(r.createdAt).toLocaleString()} • reporter: {r.reporter?.email}
            </div>
            <div className="font-medium">{r.post?.title}</div>
            <div className="text-sm text-neutral-700">Reason: {r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
