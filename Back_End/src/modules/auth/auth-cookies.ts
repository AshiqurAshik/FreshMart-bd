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
            maxAge: 15 * 60 * 1000,
        },
        refresh: {
            ...baseOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
