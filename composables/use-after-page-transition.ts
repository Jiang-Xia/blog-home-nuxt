/**
 * Wait for the current page transition to finish before updating reactive state.
 * Avoids Vue "Slot default invoked outside of the render function" warnings
 * when RouterView transitions (scale out-in) are still active.
 *
 * Must be called during setup (not inside onMounted), because it uses useNuxtApp().
 */
export function waitForPageTransition(): Promise<void> {
  return new Promise((resolve) => {
    const nuxtApp = useNuxtApp();
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    nuxtApp.hook('page:transition:finish', done);
    // scale transition is 200ms; fallback when the hook does not fire
    setTimeout(done, 250);
  });
}
