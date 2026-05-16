export interface Env {
  SITE_URL: string;
  // Set via `wrangler secret put SYNC_SECRET`. Must match SYNC_SECRET in
  // the Next.js deployment environment (Vercel project env).
  SYNC_SECRET: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const url = `${env.SITE_URL}/api/sync`;
    if (!env.SYNC_SECRET) {
      console.error('[SYNC CRON] SYNC_SECRET is not configured on the worker');
      return;
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-sync-secret': env.SYNC_SECRET,
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[SYNC CRON] Non-200 from ${url}: ${res.status} ${body}`);
      } else {
        console.log(`[SYNC CRON] Sync completed successfully`);
      }
    } catch (err) {
      console.error(`[SYNC CRON] Error calling ${url}:`, err);
    }
  },
};

