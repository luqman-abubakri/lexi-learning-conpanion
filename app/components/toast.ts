export const toast = {
  success: (message: string) => {
    if (typeof window === 'undefined') return;
    // Lightweight fallback if a toast library isn't configured.
    // Replace with Sonner/Toaster if already present in your app.
    // eslint-disable-next-line no-console
    console.log('Toast success:', message);
    window.alert(message);
  },
  error: (message: string) => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line no-console
    console.error('Toast error:', message);
    window.alert(message);
  },
};

