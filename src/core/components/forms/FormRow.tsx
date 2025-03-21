import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

const FormRow = ({ children }: Props) => {
    return (
        <div className="flex gap-4">
            {children}
        </div>
    );
};

export default FormRow;
