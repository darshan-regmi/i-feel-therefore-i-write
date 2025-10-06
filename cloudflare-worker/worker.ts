export interface Env {
  SITE_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const url = `${env.SITE_URL}/api/sync`;
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'accept': 'application/json' } });
      if (!res.ok) {
        console.error(`[SYNC CRON] Non-200 from ${url}: ${res.status}`);
      }
    } catch (err) {
      console.error(`[SYNC CRON] Error calling ${url}:`, err);
    }
  },
};

