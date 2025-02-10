import { createElement, ReactNode } from "react";

export class Utils {
    static getStars = (rating: number): ReactNode[] => {

        const getFilledStar = (key: string): ReactNode => {
            return (
                createElement("img", {
                    src: "/assets/ic_fill_star.svg",
                    alt: "filled star icon",
                    className: "h-5 w-5",
                    key: key
                })
            );
        }

        const getOutlinedStar = (key: string): ReactNode => {
            return (
                createElement("img", {
                    src: "/assets/ic_outline_star.svg",
                    alt: "outlined star icon",
                    className: "h-5 w-5",
                    key: key
                })
            );
        }

        const stars: ReactNode[] = [];
        for (let i = 0; i < 5; i++) {
            stars.push(i < rating ? getFilledStar(`${i}`) : getOutlinedStar(`${i + 5}`));
        }
        return stars;
    };

    static isValidToken = (token?: string): boolean => {
        if (!token) return false;

        const decodedToken = Utils.decodeJwt(token);
        if (!decodedToken) {
            localStorage.removeItem("token");
            return false;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp > currentTime) {
            return true;
        }

        localStorage.removeItem("token");
        return false;
    }

    static removeToken = (): void => {
        localStorage.removeItem("token");
    }

    static decodeJwt = (token: string): any => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error("Error decoding token:", err);
            return null;
        }
    };
}
