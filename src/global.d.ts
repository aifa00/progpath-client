interface Window {
    Razorpay: any;
}

declare module 'dompurify' {
    export function sanitize(dirty: string): string;
}