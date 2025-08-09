# Next steps: Supabase setup and running locally

## Prereqs
- Node.js 18+ and npm installed
- A Supabase account

## 1) Create a Supabase project
1. In the Supabase dashboard, create a new project
2. Copy your project values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Add env vars to the app
Create `.env.local` in the project root:

```ini
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after setting this.

## 3) Create the Storage bucket and policies
Create a bucket:
- Name: `receipts`
- Public: Off (private)

Then add storage policies (SQL editor):

```sql
-- Allow authenticated users to manage their objects in the `receipts` bucket
create policy "objects_insert_receipts" on storage.objects
for insert to authenticated
with check (bucket_id = 'receipts');

create policy "objects_select_receipts" on storage.objects
for select to authenticated
using (bucket_id = 'receipts' and owner = auth.uid());

create policy "objects_update_receipts" on storage.objects
for update to authenticated
using (bucket_id = 'receipts' and owner = auth.uid())
with check (bucket_id = 'receipts' and owner = auth.uid());

create policy "objects_delete_receipts" on storage.objects
for delete to authenticated
using (bucket_id = 'receipts' and owner = auth.uid());
```

## 4) Create database tables and RLS
In Supabase → SQL Editor, run the schema at:
`supabase/migrations/20250808_schema.sql`

This creates tables: `receipts`, `participants`, `receipt_items`, `assignments`, `receipt_meta` and applies RLS (including read-only public view via `public_view_enabled`).

## 5) Enable Google login
1. Supabase → Authentication → Providers → Google → Enable
2. In Google Cloud Console, create an OAuth 2.0 Client (Web app) with redirect URI:
   - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
3. Paste the Google Client ID/Secret into Supabase Google provider settings
4. Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Optionally allow: `http://127.0.0.1:3000`

## 6) Wire Edge Functions (simple proxy)
The app calls `fetch('/functions/v1/...')`. Add a rewrite so Next.js forwards these to your Supabase Functions endpoint.

Edit `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/functions/v1/:path*',
        destination: 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
```

Replace `<YOUR_PROJECT_REF>` with your Supabase project ref (from your project URL). Restart the dev server after this change.

Optional: deploy the stub Edge Functions now:

```bash
npx supabase functions deploy extract-receipt-items --project-ref <YOUR_PROJECT_REF>
npx supabase functions deploy map-assignments --project-ref <YOUR_PROJECT_REF>
npx supabase functions deploy create-share-link --project-ref <YOUR_PROJECT_REF>
```

## 7) Install dependencies and run the app
From the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 8) Quick verification
- `/login`: sign in with Google
- `/receipt/new`: upload an image to create a receipt (Edge function is a stub that returns sample data)
- `/`: should list receipts
- `/receipt/[id]/edit`: see items, participants, prompt (stub), share toggle (stub), and split summary

## Optional: run Supabase locally (Docker)
```bash
npx supabase start
```

Copy local keys from `npx supabase status` (or `supabase/.temp/.env`) into `.env.local`.

Recreate the `receipts` bucket locally and run the same schema + storage policies.

If using local functions, change the rewrite destination to:

```ts
destination: 'http://127.0.0.1:54321/functions/v1/:path*'
```

You now have a working local Next.js + Supabase setup with clear steps to wire auth, storage, schema, and functions.
