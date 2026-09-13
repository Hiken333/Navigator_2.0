<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Forms: bits-ui vs shadcn</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-12">
	<div class="space-y-2">
		<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Demo</p>
		<h1 class="text-3xl font-semibold tracking-tight">Одна форма — два UI-слоя</h1>
		<p class="text-muted-foreground">
			Одинаковые поля, каталоги с поиском, zod-схема и контроллер состояния. Отличается только набор
			компонентов.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Card>
			<CardHeader>
				<Badge variant="outline">1</Badge>
				<CardTitle>bits-ui</CardTitle>
				<CardDescription>
					Headless primitives + обёртки в <code>$lib/components/bits</code>. Максимум контроля стиля
					под IDE.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<a class={buttonVariants()} href="/demo/forms/bits">Открыть bits-форму</a>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<Badge variant="outline">2</Badge>
				<CardTitle>shadcn-svelte</CardTitle>
				<CardDescription>
					Готовый визуальный слой в <code>$lib/components/ui</code> (внутри тоже bits-ui). Быстрый
					saas-вид.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<a class={buttonVariants({ variant: 'secondary' })} href="/demo/forms/shadcn"
					>Открыть shadcn-форму</a
				>
			</CardContent>
		</Card>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Что переиспользуется</CardTitle>
			<CardDescription>Общий домен — не дублируется между демо.</CardDescription>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-muted-foreground">
			<p>
				<code>$lib/forms/operation</code> — types, catalog, zod schema,
				<code>createOperationForm()</code>
			</p>
			<p><code>FormSection.svelte</code> — одинаковая сетка секций</p>
			<p>
				Поля: ТБП/view/method/филиал/юзеры/теги (поиск), select, switch, checkbox, dialog, textarea
			</p>
		</CardContent>
	</Card>

	<a class="text-sm text-primary underline-offset-4 hover:underline" href="/">← На главную</a>
</main>
