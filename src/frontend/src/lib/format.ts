/**
 * Formatting utilities for consistent display of currency and dates across the application.
 */

/**
 * Format bigint cents to currency string
 */
export function formatCurrency(cents: bigint | number): string {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents;
  return `$${(amount / 100).toFixed(2)}`;
}

/**
 * Format timestamp (nanoseconds) to readable date/time
 */
export function formatDateTime(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  const date = new Date(milliseconds);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format timestamp to date only
 */
export function formatDate(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  const date = new Date(milliseconds);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to time only
 */
export function formatTime(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  const date = new Date(milliseconds);
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
