import { useState } from "react";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormSchema, LoginFormType } from "../../core/schemas/LoginFormSchema";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay, InputForm } from "../../core/components";

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (username: string, password: string) => {
        console.log("Logging in:", username, password);
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            navigate("/dashboard/talentos");
        }, 1000);
    };

    return { handleLogin, loading };
};

export const Login = () => {
    const { handleLogin, loading } = useLogin();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        mode: "onTouched",
        defaultValues: { username: "", password: "" },
    });

    const login: SubmitHandler<LoginFormType> = (data) => {
        return handleLogin(data.username, data.password);
    };

    if (loading) return <LoadingOverlay />;

    return (
        <div className="flex h-screen">
            <section className="flex-1 flex flex-col items-center justify-center">
                <form onSubmit={handleSubmit(login)} className="flex flex-col w-3/4 p-4">
                    <div className="*:mb-4">
                        <img src="/assets/fractal-logo.png" alt="Fractal Banco Talentos" />
                        <h2 className="font-bold text-lg mt-8">Inicio de sesión</h2>
                        <h3>Inicia sesión</h3>
                    </div>

                    <InputForm
                        name="username"
                        control={control}
                        label="Usuario"
                        error={errors.username}
                    />
                    <div className="relative">
                        <InputForm
                            name="password"
                            control={control}
                            label="Contraseña"
                            type={passwordVisible ? "text" : "password"}
                            error={errors.password}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-2 top-9 h-6 w-6 text-gray-500" >
                            {passwordVisible
                                ? (<img src="/assets/ic_show_pass.svg" alt="show pass" />)
                                : (<img src="/assets/ic_hide_pass.svg" alt="hide pass" />)
                            }
                        </button>
                    </div>
                    <button type="submit" className="bg-[#009688] text-white focus:outline-none rounded-lg py-2 my-2">
                        Iniciar sesión
                    </button>
                </form>
            </section>
            <section className="flex-1 flex-col items-center justify-center bg-[#F4F4F5] relative hidden lg:flex">
                <img src="assets/map.png" alt="Map" />
                <img src="assets/people.png" alt="Login" className="absolute" />
            </section>
        </div>
    );
}