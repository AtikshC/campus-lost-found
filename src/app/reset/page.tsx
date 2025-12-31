"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

export default function ResetPage() {
  const [pw, setPw] = useState("");

  return (
    <div className="max-w-lg mx-auto">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="text-sm text-neutral-200">
          Enter a new password after opening the reset link from your email.
        </p>

        <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />

        <Button
          className="w-full py-3"
          onClick={async () => {
            if (pw.length < 6) return toast.error("Password too short.");
            const { error } = await supabase.auth.updateUser({ password: pw });
            if (error) return toast.error(error.message);
            toast.success("Password updated! You can sign in now.");
          }}
        >
          Update password
        </Button>
      </Card>
    </div>
  );
}
