<script lang="ts">
	import { goto } from "$app/navigation";
	import { Progress } from "$lib/components/ui/progress";
	import { validateSession } from "$lib/api/auth";
	import { session } from "$lib/stores/session";

	let { children } = $props();

	let ready = $state(false);
	let checking = $state(true);

	$effect(() => {
		let cancelled = false;

		(async () => {
			checking = true;
			ready = false;

			const s = $session;
			if (!s) {
				await goto("/login");
				checking = false;
				return;
			}

			const ok = await validateSession(s.sessionId);
			if (cancelled) return;

			if (!ok) {
				session.set(null);
				await goto("/login");
				checking = false;
				return;
			}

			ready = true;
			checking = false;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

{#if checking}
	<div class="flex min-h-[50vh] flex-col items-center justify-center gap-4">
		<Progress value={null} class="w-48" />
		<p class="text-sm text-muted-foreground">Проверка сессии…</p>
	</div>
{:else if ready}
	{@render children()}
{/if}
