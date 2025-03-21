interface Props {
    backClicked: () => void;
}

const BackButton = ({ backClicked }: Props) => {
    return (
        <img
            src="/assets/arrow_back.svg"
            alt="Back Home"
            className="cursor-pointer w-8 me-4"
            onClick={backClicked}
        />
    );
};

export default BackButton;
