import { ArrowLeft } from "lucide-react";

interface Props {
    backClicked: () => void;
}

const BackButton = ({ backClicked }: Props) => {
    return (
        <ArrowLeft
            aria-label="Back Home"
            className="cursor-pointer w-8 h-8 me-4"
            onClick={backClicked}
        />
    );
};

export default BackButton;
