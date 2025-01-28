import { createElement, ReactNode } from "react";

export class Utils {
    static getStars = (rating: number): ReactNode[] => {
        const filledStar = createElement("img", {
            src: "/assets/ic_fill_star.svg",
            alt: "filled star icon",
            className: "h-5 w-5"
        });

        const outlinedStar = createElement("img", {
            src: "/assets/ic_outline_star.svg",
            alt: "outlined star icon",
            className: "h-5 w-5"
        });

        const stars: ReactNode[] = [];
        for (let i = 0; i < 5; i++) {
            stars.push(i < rating ? filledStar : outlinedStar);
        }
        return stars;
    };
}
