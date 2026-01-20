import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom providers wrapper
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Custom render with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
