<script lang="ts">
    import { goto } from "$app/navigation";
    import { ApiError, HttpError } from "as2mca-api";
    import { login } from "$lib/api/auth";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Field from "$lib/components/ui/field"
    import { FieldError } from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";
    import { Spinner } from "$lib/components/ui/spinner";
    import { session } from "$lib/stores/session";

    let username = $state("");
    let password = $state("");
    let submitting = $state(false);
    let formError = $state("");
    let usernameError = $state("");
    let passwordError = $state("");

    $effect(() => {
        if ($session) {
            void goto("/");
        }
    });

    function loginErrorMessage(error: unknown) {
        if (error instanceof HttpError) {
            if (error.code === 401 || error.code === 403) {
                return "Неверный логин или пароль";
            }
            return "Не удалось связаться с сервером";
        }
        if (error instanceof ApiError) {
            return error.message || "Не удалось войти";
        }
        return "Не удалось войти";
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        formError = "";
        usernameError = username.trim() ? "" : "Введите логин";
        passwordError = password ? "" : "Введите пароль";
        if (usernameError || passwordError) return;

        submitting = true;
        try {
            const result = await login(username.trim(), password);
            session.set({
                sessionId: result.session.sessionId,
                userInfo: result.userInfo,
            });
            await goto("/");
        } catch (error) {
            formError = loginErrorMessage(error);
        } finally {
            submitting = false;
        }
    }
</script>

<svelte:head>
    <title>Вход — Element</title>
</svelte:head>

<div class="flex min-h-svh items-center justify-center p-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title>Element</Card.Title>
            <Card.Description>Вход в систему</Card.Description>
        </Card.Header>
        <form class="contents" onsubmit={handleSubmit}>
            <Card.Content>
                <Field.FieldGroup class="gap-4">
                    <Field.Field data-disabled={submitting || undefined}>
                        <Field.FieldLabel for="username">Логин</Field.FieldLabel
                        >
                        <Input
                            id="username"
                            name="username"
                            autocomplete="username"
                            bind:value={username}
                            disabled={submitting}
                            aria-describedby={usernameError
                                ? "username-error"
                                : undefined}
                            oninput={() => {
                                usernameError = "";
                            }}
                        />
                        {#if usernameError}
                            <Field.FieldDescription id="username-error"
                                >{usernameError}</Field.FieldDescription
                            >
                        {/if}
                    </Field.Field>
                    <Field.Field data-disabled={submitting || undefined}>
                        <Field.FieldLabel for="password"
                            >Пароль</Field.FieldLabel
                        >
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            bind:value={password}
                            disabled={submitting}
                            aria-describedby={passwordError
                                ? "password-error"
                                : undefined}
                            oninput={() => {
                                passwordError = "";
                            }}
                        />
                        {#if passwordError}
                            <Field.FieldDescription id="password-error"
                                >{passwordError}</Field.FieldDescription
                            >
                        {/if}
                    </Field.Field>
                    {#if formError}
                        <FieldError
                            >{formError}</FieldError
                        >
                    {/if}
                </Field.FieldGroup>
            </Card.Content>
            <Card.Footer>
                <Button
                    type="submit"
                    variant="outline"
                    class="w-full"
                    disabled={submitting}
                >
                    {#if submitting}
                        <Spinner data-icon="inline-start" />
                        Вход…
                    {:else}
                        Войти
                    {/if}
                </Button>
            </Card.Footer>
        </form>
    </Card.Root>
</div>
