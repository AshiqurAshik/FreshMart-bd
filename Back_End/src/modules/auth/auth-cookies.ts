import { CookieOptions, Response } from "express";

export const AUTH_COOKIE_NAMES = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
} as const;

export interface AuthCookieConfig {
    access: CookieOptions;
    refresh: CookieOptions;
    clearAccess: CookieOptions;
    clearRefresh: CookieOptions;
}

export function getAuthCookieOptions(): AuthCookieConfig {
    const isProduction = process.env.NODE_ENV === "production";

    // In production with cross-origin deployments (e.g. backend and frontend on different domains),
    // sameSite must be 'none' and secure must be true.
    // In local development (HTTP), sameSite: 'lax' and secure: false allow Postman and local browsers to work seamlessly.
    const sameSite: CookieOptions["sameSite"] = isProduction ? "none" : "lax";
    const secure: boolean = isProduction;

    const baseOptions: CookieOptions = {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
    };

    return {
        access: {
            ...baseOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes (matches 15m in JWT)
        },
        refresh: {
            ...baseOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches 7d in JWT)
        },
        clearAccess: {
            ...baseOptions,
            maxAge: 0,
        },
        clearRefresh: {
            ...baseOptions,
            maxAge: 0,
        },
    };
}

export function setAuthCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string }
): void {
    const options = getAuthCookieOptions();
    res.cookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, options.access);
    res.cookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, options.refresh);
}

export function clearAuthCookies(res: Response): void {
    const options = getAuthCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, options.clearAccess);
    res.clearCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, options.clearRefresh);
}
