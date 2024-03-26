// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { SupabaseClient, Session } from "@supabase/supabase-js";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			supabase: SupabaseClient
			session: Session | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
