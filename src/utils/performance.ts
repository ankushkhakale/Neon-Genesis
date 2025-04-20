
/**
 * Debounce function to limit the rate at which a function can fire
 * @param fn The function to debounce
 * @param ms The debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param fn The function to throttle
 * @param ms The throttle delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let shouldWait = false;
  let waitingArgs: Parameters<T> | null = null;
  
  const timeoutFunc = () => {
    if (waitingArgs === null) {
      shouldWait = false;
    } else {
      fn(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, ms);
    }
  };
  
  return function(this: any, ...args: Parameters<T>) {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }
    
    fn.apply(this, args);
    shouldWait = true;
    
    setTimeout(timeoutFunc, ms);
  };
}

/**
 * Lazy loads an image and returns a promise that resolves when loaded
 * @param src Image source URL
 * @returns Promise that resolves when the image is loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Checks if the browser supports the WebP image format
 * @returns Promise that resolves to a boolean indicating WebP support
 */
export async function supportsWebP(): Promise<boolean> {
  if (!self.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  return createImageBitmap(blob).then(() => true, () => false);
}
