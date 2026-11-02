import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Manual "Send reminder" from the owner dashboard. Uses the same claim + send logic as the hourly job.
export const sendReminderNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ bookingId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: membership, error } = await context.supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || !membership) throw new Error("Forbidden");

    const { processReminders } = await import("./reminders.server");
    const results = await processReminders(data.bookingId);
    if (results.length === 0) {
      return { status: "skipped" as const, error: "Already sent, cancelled, or no valid email." };
    }
    const r = results[0]!;
    return { status: r.status, error: r.error ?? null };
  });
