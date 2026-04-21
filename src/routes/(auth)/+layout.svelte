<!-- src/routes/(auth)/+layout.svelte -->
<script lang="ts">
  let { children } = $props();
</script>

<!--
  Auth pages (signin, signup, forgot-password, reset-password, verify-otp)
  manage their own full-screen layout with their own brand panel.
  We render children directly, bypassing the global nav in +layout.svelte.
-->
{@render children()}