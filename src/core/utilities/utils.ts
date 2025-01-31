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
}
