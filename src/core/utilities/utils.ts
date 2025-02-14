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

        const decodedToken = this.decodeJwt(token);
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

    static buildQueryString = (params: Record<string, any>): string => {
        const queryParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, value.toString());
            }
        }

        return queryParams.toString();
    };

    static getImageSrc = (base64String: string) => {
        const formato = this.detectarFormatoDesdeBase64(base64String);
        const base64WithPrefix = this.addBase64ImagePrefix(base64String, formato);

        if (this.isValidImageBase64(base64WithPrefix)) {
            return base64WithPrefix;
        }
        return "/assets/ic_no_image.svg";
    };

    static detectarFormatoDesdeBase64 = (base64String: string) => {
        if (base64String.startsWith("iVBORw0KGgo")) {
            return "png";
        } else if (base64String.startsWith("/9j/4AAQSkZJRg")) {
            return "jpeg";
        }

        return "jpeg";
    };

    static isValidImageBase64 = (base64String: string) => {
        return /^data:image\/(jpeg|png|jpg);base64,[A-Za-z0-9+/=]+$/.test(base64String);
    };

    static addBase64ImagePrefix = (base64String: string, formato: string) => {
        if (base64String && !base64String.startsWith('data:image/')) {
            return `data:image/${formato};base64,${base64String}`;
        }
        return base64String;
    };

    static splitDateAsNumbers = (date?: string | null) => {
        if (!date?.trim()) {
            return { day: "", month: "", year: "" };
        }

        // DMY Format
        const [day, month, year] = date.split('-');

        return { day: day, month: month, year: year };
    }

    static fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    };
}
