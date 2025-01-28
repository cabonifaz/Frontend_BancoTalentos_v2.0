import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { Utils } from "../../core/utils";
import { Education, Experience, Feedback, Language, Talent } from "../../core/models";
import {
    Modal,
    Pagination,
    TalentCard,
    FeedbackCard,
    LanguageCard,
    OptionsButton,
    EducationCard,
    FilterDropDown,
    ExperienceCard,
} from '../../core/components';
import { useModal } from "../../core/context/ModalContext";

export const Talents = () => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [talent, setTalent] = useState<Talent | null>(null);
    const { openModal, closeModal } = useModal();

    const handleToggle = (index: number) => {
        setOpenDropdown((prev) => (prev === index ? null : index));
    };

    const talents: Talent[] = [
        {
            name: 'Kelvin Huanca Arcos',
            profession: 'UX/UI Designer',
            location: 'Lima, Perú',
            salaryRxHInit: 0,
            salaryRxHEnd: 8000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 7000,
            rating: 0, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Mariana Torres',
            profession: 'Frontend Developer',
            location: 'Buenos Aires, Argentina',
            salaryRxHInit: 0,
            salaryRxHEnd: 10000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 9000,
            rating: 4, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Jorge Ramirez',
            profession: 'Backend Developer',
            location: 'Santiago, Chile',
            salaryRxHInit: 0,
            salaryRxHEnd: 12000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 11000,
            rating: 5, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Carlos Pérez',
            profession: 'Backend Developer',
            location: 'Mexico City, Mexico',
            salaryRxHInit: 0,
            salaryRxHEnd: 12000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 11000,
            rating: 4.5, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Lucia González',
            profession: 'UI/UX Designer',
            location: 'Madrid, Spain',
            salaryRxHInit: 0,
            salaryRxHEnd: 9500,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 8500,
            rating: 4.8, // 0 to 5 stars
            image: '',
        }
    ];

    const dropdowns: {
        name: string;
        label: string;
        options: string[];
        optionsType: "checkbox" | "radio";
        optionsPanelSize: string;
        inputPosition: "left" | "right";
    }[] = [
            {
                name: "habilidades",
                label: "Habilidades",
                options: ["Frontend", "Backend", "Asistente de marketing/Intérprete"],
                optionsType: "checkbox",
                optionsPanelSize: "w-72",
                inputPosition: "left",
            },
            {
                name: "nivelIngles",
                label: "Nivel de inglés",
                options: ["Básico", "Intermedio", "Avanzado"],
                optionsType: "radio",
                optionsPanelSize: "w-32",
                inputPosition: "right",
            },
            {
                name: "favoritos",
                label: "Favoritos",
                options: ["Favoritos", "Seniors"],
                optionsType: "radio",
                optionsPanelSize: "w-32",
                inputPosition: "right",
            },
        ];

    const educationData: Education =
    {
        idEducation: 1,
        image: '',
        entityName: 'University of XYZ',
        description: 'Bachelor of Science in Computer Science',
        startYear: 2015,
        endYear: 2019,
    };

    const experienceData: Experience =
    {
        idExperience: 1,
        image: '',
        entityName: 'University of XYZ',
        description: 'Bachelor of Science in Computer Science',
        startYear: 2015,
        endYear: 2019,
    };

    const languageData: Language = {
        idLanguage: 1,
        languageName: 'English',
        languageCode: 'EN',
        idProficiency: 3,
        proficiency: 'Advanced',
        starCount: 3,
    };

    const feedbackData: Feedback = {
        image: '',
        user: 'John Doe',
        feedback: 'This is a fantastic product! I am really satisfied with the quality and performance.',
        stars: 4,
    };

    return (
        <div className="relative">
            <Dashboard>
                <div className="py-3 px-4 2xl:px-[155px]">
                    {/* Options section */}
                    <div className="flex w-full h-12 items-center justify-between">
                        <div className="flex flex-col lg:flex-row flex-grow items-center gap-7">
                            <button
                                type="button"
                                className="flex items-center gap-1 py-2 px-3 border border-[#3b82f6] hover:bg-blue-50 text-sm font-normal text-[#3b82f6] text-center rounded-lg">
                                <img src="/assets/ic_add.svg" alt="add talent icon" />
                                <span>Nuevo Talento</span>
                            </button>
                            <p className="text-sm text-[#71717A] hidden xl:block">{`${talents.length} resultados disponibles para tu búsqueda`}</p>
                        </div>
                        <div className="flex flex-grow gap-12 h-12">
                            {/* Filters */}
                            <div className="flex flex-row flex-grow justify-around items-center">
                                {dropdowns.map((dropdown, index) => (
                                    <FilterDropDown
                                        key={index}
                                        {...dropdown}
                                        isOpen={openDropdown === index}
                                        onToggle={() => handleToggle(index)}
                                    />
                                ))}
                            </div>
                            {/* Search */}
                            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-16">
                                <div className="flex relative h-10">
                                    <img src="/assets/ic_search.svg" alt="search icon" className="absolute top-2 left-3" />
                                    <input type="text" placeholder="Buscar por talento o puesto" className="text-sm w-80 rounded-full ps-10 pe-4 border-2 focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                                <button type="button" className="bg-[#009695] hover:bg-[#2d8d8d] rounded-lg focus:outline-none text-white py-2 px-4 font-normal text-normal">Buscar</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex mt-4 gap-4 h-[calc(100vh-175px)]">
                        {/* Talents list */}
                        <div className="flex flex-col w-1/3">
                            <div className="*:mb-2">
                                {talents.map((talent, index) => (
                                    <TalentCard
                                        key={index}
                                        talent={talent}
                                        selectTalent={() => setTalent(talent)} />
                                ))}
                            </div>
                            {/* Pagination */}
                            <div>
                                <Pagination
                                    totalItems={talents.length + 25}
                                    itemsPerPage={5}
                                    onPaginate={() => { }}
                                />
                            </div>
                        </div>
                        {/* Talent details */}
                        <div className="border-2 shadow-xl rounded-lg w-2/3">
                            {talent && (
                                <div className="flex flex-col p-8 overflow-y-scroll overflow-x-hidden h-[calc(100vh-180px)]">
                                    {/* Talent main info */}
                                    <div className="flex items-center w-full justify-between">
                                        <div className="flex gap-10 h-28">
                                            <div className="relative">
                                                <img src={talent.image ? talent.image : "/assets/ic_no_image.svg"} alt="Foto Perfil Talento" className="h-24 w-24 rounded-full border" />
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalEditPhoto")}
                                                    className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50">
                                                    <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                                </button>
                                                <Modal id="modalEditPhoto" title="Modifica tu foto de perfil">
                                                    <div>
                                                        <h3 className="text-[#71717A] text-sm mt-6">Sube una nueva foto de perfil.</h3>
                                                        <div className="rounded-lg overflow-hidden py-4">
                                                            <div className="w-full">
                                                                <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                                                                    <div className="absolute flex flex-col items-center py-12">
                                                                        <img
                                                                            alt="File Icon"
                                                                            className="mb-3 mt-6 w-8 h-8"
                                                                            src="/assets/ic_upload.svg"
                                                                        />
                                                                        <span className="block text-[#0b85c3] font-normal mt-1">
                                                                            Sube una nueva foto de perfil
                                                                        </span>
                                                                        <span className="text-sm text-[#71717A] mb-6">PNG o JPG</span>
                                                                    </div>
                                                                    <input
                                                                        name="user-photo"
                                                                        className="h-full w-full opacity-0 cursor-pointer"
                                                                        type="file"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeModal("modalEditPhoto")}
                                                                className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                <p className="mx-auto">Cancelar</p>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                <p className="mx-auto">Editar</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Modal>
                                            </div>
                                            <div>
                                                <p className="text-base">{talent.name}</p>
                                                <p className="text-sm text-[#71717A] flex items-end my-1 h-5">
                                                    <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                                                    {talent.location}
                                                </p>
                                                <p className="text-sm text-[#71717A] flex gap-2 h-5">
                                                    {`RxH S/. ${talent.salaryRxHInit} - ${talent.salaryRxHEnd} | Planilla S/. ${talent.salaryPlanillaInit} - ${talent.salaryPlanillaEnd} `}
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal("modalSalary")}
                                                        className="hover:rounded-full hover:shadow-inner px-2">
                                                        <img src="/assets/ic_edit.svg" alt="icon edit" className="h-4 w-4 mb-1 opacity-40 hover:opacity-80" />
                                                    </button>
                                                    <Modal id="modalSalary" title="Modifica to banda salarial">
                                                        <div>
                                                            <h3 className="text-[#71717A] text-sm mt-6">Agrega el rango de tus espectativas salariales.</h3>
                                                            <select name="currency" id="currency" className="w-full my-4 h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                                <option value={1}>Nuevo Sol</option>
                                                                <option value={2}>Dólar Americano</option>
                                                            </select>
                                                            <h3 className="w-full my-2">Monto por RXH</h3>
                                                            <div className="flex w-full gap-8">
                                                                <div className="flex flex-col w-1/2">
                                                                    <label htmlFor="initRxH" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                                                                    <input type="text" name="initRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                                </div>
                                                                <div className="flex flex-col w-1/2">
                                                                    <label htmlFor="endRxH" className="text-[#71717A] text-sm my-2">Monto final</label>
                                                                    <input type="text" name="endtRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                                </div>
                                                            </div>
                                                            <h3 className="w-full mb-2 mt-6">Monto por planilla</h3>
                                                            <div className="flex w-full gap-8">
                                                                <div className="flex flex-col w-1/2">
                                                                    <label htmlFor="initPlanilla" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                                                                    <input type="text" name="initPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                                </div>
                                                                <div className="flex flex-col w-1/2">
                                                                    <label htmlFor="endPlanilla" className="text-[#71717A] text-sm my-2">Monto final</label>
                                                                    <input type="text" name="endPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                                </div>
                                                            </div>
                                                            <div className="flex mt-8 gap-8 *:px-4 *:py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => closeModal("modalSalary")}
                                                                    className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                    <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                    <p className="mx-auto">Cancelar</p>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                    <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                    <p className="mx-auto">Editar</p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                </p>
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex gap-2 my-2">
                                                        {Utils.getStars(talent.rating)}
                                                    </div>
                                                    {talent.rating <= 0 && (<p className="text-sm text-[#71717A]">Ningún feedback Registrado</p>)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-24 justify-self-end h-28">
                                            {/* CV */}
                                            <OptionsButton
                                                options={["CV", "CV Fractal"]}
                                                onSelect={() => openModal('modalCv')}
                                                buttonLabel="Ver CV"
                                                buttonStyle="w-32 py-2 px-4 bg-white text-[#3b82f6] rounded-lg focus:outline-none hover:bg-[#f5f9ff]"
                                            />
                                            <Modal id="modalCv" title="Curriculum Vitae">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">Curriculum Vitae</h3>
                                                    <div className="my-8 flex flex-col justify-center w-fit items-center relative self-center">
                                                        <img src="/assets/ic_pdf_info.svg" alt="icon pdf" className="w-48 h-48" />
                                                        <p className="text-[#71717A] text-xs my-2 text-ellipsis max-w-40 line-clamp-1">CV username userlastname userlastname userlastname</p>
                                                        <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100">
                                                            <img src="/assets/ic_edit.svg" alt="icon edit" className="absolute right-0 top-0 w-6 h-6" />
                                                        </button>
                                                        <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100">
                                                            <img src="/assets/ic_show_pass.svg" alt="icon eye" className="absolute right-0 bottom-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                            {/* Contact */}
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openModal('modalContact')}
                                                    className="flex items-center bg-[#009695] hover:bg-[#2d8d8d] rounded-lg focus:outline-none text-white px-4 py-2 gap-2">
                                                    <img src="/assets/ic_phone.svg" alt="icon contact" className="h-5 w-5" />
                                                    Contactar
                                                </button>
                                                <Modal id="modalContact" title="Métodos de Contacto">
                                                    <div className="flex flex-col mt-6 gap-4">
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <label htmlFor="email" className="w-full">Correo Electrónico</label>
                                                            <div className="flex justify-between">
                                                                <input type="text" name="email" className="p-3 border-gray-300 border-2 rounded-lg w-[93%] focus:outline-none focus:border-[#4F46E5]" />
                                                                <button type="button" className="w-12 h-12 p-3 bg-[#4F46E5] rounded-lg">
                                                                    <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label htmlFor="phone" className="w-full">Número de Celular</label>
                                                            <div className="flex">
                                                                <p className="rounded-l-lg border-l-2 border-t-2 border-b-2 px-3 border-gray-300 bg-gray-100 flex items-center">+51</p>
                                                                <input type="text" name="phone" className="p-3 border-gray-300 border-2 rounded-r-lg w-[90%] focus:outline-none focus:border-[#4F46E5]" />
                                                                <button type="button" className="w-12 h-12 ms-4 p-3 bg-[#4F46E5] rounded-lg justify-self-end">
                                                                    <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeModal("modalContact")}
                                                                className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                <p className="mx-auto">Cancelar</p>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                <p className="mx-auto">Actualizar</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Modal>
                                                <div className="flex gap-4 justify-center items-end">
                                                    <a href="/#">
                                                        <img src="/assets/ic_github.svg" alt="icon github" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                    </a>
                                                    <a href="/#">
                                                        <img src="/assets/ic_linkedin.svg" alt="icon linkedin" className="h-8 w-8 opacity-40 hover:opacity-80" />
                                                    </a>
                                                    <button type="button" onClick={() => openModal("modalSocialMedia")}>
                                                        <img src="/assets/ic_edit.svg" alt="icon edit" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                    </button>
                                                    <Modal id="modalSocialMedia" title="Modifica tus medios sociales">
                                                        <div>
                                                            <h3 className="text-[#71717A] text-sm mt-6">Agrega y muestra tus medios sociales</h3>
                                                            <div className="flex flex-col my-2">
                                                                <label htmlFor="linkedin" className="text-[#37404c] text-base my-2">LinkedIn</label>
                                                                <input type="text" name="linkedin" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                            </div>
                                                            <div className="flex flex-col my-2">
                                                                <label htmlFor="github" className="text-[#37404c] text-base my-2">Github</label>
                                                                <input type="text" name="github" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                            </div>
                                                            <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => closeModal("modalSocialMedia")}
                                                                    className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                    <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                    <p className="mx-auto">Cancelar</p>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                    <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                    <p className="mx-auto">Editar</p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* File upload */}
                                    <div className="flex items-center w-full justify-between">
                                        <p className="text-[#609af8]"> Sube tu certificado, diploma o algún archivo que respalde tus aptitudes. </p>
                                        <div className="rounded-lg overflow-hidden max-w-xl">
                                            <div className="w-full py-12">
                                                <div className="relative h-32 rounded-lg bg-gray-50 flex justify-center items-center hover:bg-gray-100">
                                                    <div className="absolute flex flex-col items-center">
                                                        <img
                                                            alt="File Icon"
                                                            className="mb-3 w-8 h-8"
                                                            src="/assets/ic_upload.svg"
                                                        />
                                                        <span className="block text-[#0b85c3] font-normal mt-1">
                                                            Sube un archivo
                                                        </span>
                                                    </div>

                                                    <input
                                                        name="cert-file"
                                                        className="h-full w-full opacity-0 cursor-pointer"
                                                        type="file"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Skills */}
                                    <div className="flex w-full">
                                        {/* Technical */}
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <div className="flex items-center gap-4 h-6">
                                                <p className="text-[#52525B] font-semibold">Habilidades Técnicas</p>
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalTechSkills")}
                                                    className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                    <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5"
                                                    />
                                                </button>
                                                <Modal id="modalTechSkills" title="Agregar habilidad técnica">
                                                    <div>
                                                        <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva experiencia técnica</h3>
                                                        <div className="flex flex-col my-2">
                                                            <label htmlFor="techSkill" className="text-[#37404c] text-base my-2">Habilidad técnica</label>
                                                            <input
                                                                type="text"
                                                                name="techSkill"
                                                                placeholder="Ingrese su habilidad técnica"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        </div>
                                                        <div className="flex flex-col my-2">
                                                            <label htmlFor="skillYears" className="text-[#37404c] text-base my-2">Años de experiencia</label>
                                                            <input
                                                                type="text"
                                                                name="skillYears"
                                                                placeholder="Nro. años"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        </div>
                                                        <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeModal("modalSocialMedia")}
                                                                className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                <p className="mx-auto">Cancelar</p>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                <p className="mx-auto">Agregar</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Modal>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-[#0b85c3] text-sm bg-[#f5f9ff] px-3 rounded-full font-semibold py-1">UX/UI</p>
                                            </div>
                                        </div>
                                        {/* Soft */}
                                        <div className="flex flex-col gap-4 w-1/2">
                                            <div className="flex items-center gap-4 h-6">
                                                <p className="text-[#52525B] font-semibold">Habilidades Blandas</p>
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalSoftSkills")}
                                                    className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                    <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5"
                                                    />
                                                </button>
                                                <Modal id="modalSoftSkills" title="Agregar habilidad blanda">
                                                    <div>
                                                        <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva habilidad blanda</h3>
                                                        <div className="flex flex-col my-2">
                                                            <label htmlFor="softSkill" className="text-[#37404c] text-base my-2">Habilidad blanda</label>
                                                            <input
                                                                type="text"
                                                                name="softSkill"
                                                                placeholder="Ingrese su habilidad blanda"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        </div>
                                                        <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeModal("modalSoftSkills")}
                                                                className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                                <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                                <p className="mx-auto">Cancelar</p>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                                <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                                <p className="mx-auto">Agregar</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Modal>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-[#c11574] text-sm bg-[#fef6fa] px-3 rounded-full font-semibold py-1">Responsabilidad</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div className="flex flex-col py-8 w-full gap-4">
                                        <h2 className="text-[#52525B] font-semibold my-2">Resumen profesional</h2>
                                        <div className="flex gap-4 items-center">
                                            <p className="text-justify text-[#71717A] text-sm w-fit">
                                                Soy un Ingeniero de Sistemas titulado y colegiado, actualmente finalizando una maestría en Negocios
                                                Digitales con un enfoque en el diseño y análisis de arquitecturas híbridas y en la nube, particularmente
                                                en plataformas como AWS, Azure y GCP. Mi orientación está fuertemente dirigida hacia la optimización
                                                de costos(FinOps), y poseo un conocimiento amplio en la administración de la mayoría de los servicios
                                                de AWS. Además, cuento con habilidades blandas significativas para liderar equipos de administración
                                                de infraestructura, aplicando eficientemente la metodología SCRUM y Kanban sobre herramientas Jira y
                                                Azure DevOps.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalSummary")}
                                                className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5">
                                                <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                            </button>
                                            <Modal id="modalSummary" title="Edita tu resumen profesional">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo para un nuevo resumen?. Edítelo</h3>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="summary" className="text-[#37404c] text-base my-2">Resumen profesional</label>
                                                        <textarea name="summary" id="summary" className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]"></textarea>
                                                    </div>
                                                    <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => closeModal("modalSummary")}
                                                            className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                            <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                            <p className="mx-auto">Cancelar</p>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                            <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                            <p className="mx-auto">Editar</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </div>
                                    </div>
                                    {/* Availability */}
                                    <div className="flex flex-col pb-8 justify-center">
                                        <h2 className="text-[#52525B] font-semibold my-2">Dispinobilidad</h2>
                                        <p className="text-[#71717A] text-sm flex gap-2 items-center">
                                            Inmediata
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalAvailability")}
                                                className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5">
                                                <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                            </button>
                                            <Modal id="modalAvailability" title="Edita tu disponibilidad">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo de nueva disponibilidad?. Edítela</h3>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="availability" className="text-[#37404c] text-base my-2">Disponibilidad</label>
                                                        <input
                                                            type="text"
                                                            id="availability"
                                                            name="availability"
                                                            placeholder="Disponibilidad"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                    </div>
                                                    <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => closeModal("modalAvailability")}
                                                            className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                            <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                            <p className="mx-auto">Cancelar</p>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                            <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                            <p className="mx-auto">Editar</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </p>
                                    </div>
                                    {/* Experience */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Experiencia
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalExperience")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add exp tech" className="w-5 h-5" />
                                            </button>
                                            <Modal id="modalExperience" title="Agrega una nueva experiencia">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">Describe y agrega tu nueva experiencia laboral.</h3>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="companyName" className="text-[#37404c] text-base my-2">Empresa</label>
                                                        <input
                                                            type="text"
                                                            id="companyName"
                                                            name="companyName"
                                                            placeholder="Nombre de la empresa"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                            <input type="checkbox" name="currentCompany" id="currentCompany" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                                                            <label htmlFor="currentCompany" className="cursor-pointer text-[#3f3f46] text-base">Aquí en Fractal</label>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="area" className="text-[#37404c] text-base my-2">Puesto</label>
                                                        <input
                                                            type="text"
                                                            id="area"
                                                            name="area"
                                                            placeholder="Puesto"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="flex flex-col w-1/2">
                                                            <label htmlFor="initDate" className="text-[#37404c] text-base my-2">Año y mes de inicio</label>
                                                            <input
                                                                type="month"
                                                                name="initDate"
                                                                id="initDate"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                                <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                                                                <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-base">Hasta la actualidad</label>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col w-1/2">
                                                            <label htmlFor="endDate" className="text-[#37404c] text-base my-2">Año y mes de fin</label>
                                                            <input
                                                                type="month"
                                                                name="endDate"
                                                                id="endDate"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="job" className="text-[#37404c] text-base my-2">Funciones</label>
                                                        <textarea
                                                            name="job"
                                                            id="job"
                                                            placeholder="Digitar funciones"
                                                            className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                        </textarea>
                                                    </div>

                                                    <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => closeModal("modalExperience")}
                                                            className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                            <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                            <p className="mx-auto">Cancelar</p>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                            <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                            <p className="mx-auto">Agregar</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </h2>
                                        <div className="flex flex-col">
                                            <ExperienceCard data={experienceData} />
                                            <ExperienceCard data={experienceData} />
                                            <ExperienceCard data={experienceData} />
                                        </div>
                                    </div>
                                    {/* Education */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Educación
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalEducation")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            </button>
                                            <Modal id="modalEducation" title="Agrega una nueva experiencia educativa">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">Describe y agrega tu nueva experiencia educativa.</h3>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="entity" className="text-[#37404c] text-base my-2">Institución</label>
                                                        <input
                                                            type="text"
                                                            id="entity"
                                                            name="entity"
                                                            placeholder="Nombre de la institución"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                            <input type="checkbox" name="currentEntity" id="currentEntity" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                                                            <label htmlFor="currentEntity" className="cursor-pointer text-[#3f3f46] text-base">Aquí en Fractal</label>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="major" className="text-[#37404c] text-base my-2">Carrera</label>
                                                        <input
                                                            type="text"
                                                            id="major"
                                                            name="major"
                                                            placeholder="Carrera"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                    </div>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="degree" className="text-[#37404c] text-base my-2">Grado</label>
                                                        <input
                                                            type="text"
                                                            id="degree"
                                                            name="degree"
                                                            placeholder="Grado"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="flex flex-col w-1/2">
                                                            <label htmlFor="initDateEducation" className="text-[#37404c] text-base my-2">Año y mes de inicio</label>
                                                            <input
                                                                type="month"
                                                                name="initDateEducation"
                                                                id="initDateEducation"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                                <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                                                                <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-base">Hasta la actualidad</label>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col w-1/2">
                                                            <label htmlFor="endDateEducation" className="text-[#37404c] text-base my-2">Año y mes de fin</label>
                                                            <input
                                                                type="month"
                                                                name="endDateEducation"
                                                                id="endDateEducation"
                                                                className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                        </div>
                                                    </div>

                                                    <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => closeModal("modalEducation")}
                                                            className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                            <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                            <p className="mx-auto">Cancelar</p>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                            <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                            <p className="mx-auto">Agregar</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </h2>
                                        <div className="flex flex-col">
                                            <EducationCard data={educationData} />
                                            <EducationCard data={educationData} />
                                            <EducationCard data={educationData} />
                                        </div>
                                    </div>
                                    {/* Language */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Idiomas
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalLanguage")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            </button>
                                            <Modal id="modalLanguage" title="Agrega un nuevo idioma">
                                                <div>
                                                    <h3 className="text-[#71717A] text-sm mt-6">Agregar un nuevo idioma aprendido.</h3>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="language" className="text-[#37404c] text-base my-2">Idioma</label>
                                                        <select
                                                            id="language"
                                                            name="language"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                            <option value={0}>Nombre del idioma</option>
                                                            <option value={1}>Español</option>
                                                            <option value={2}>Inglés</option>
                                                            <option value={3}>Francés</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col my-2">
                                                        <label htmlFor="proficiency" className="text-[#37404c] text-base my-2">Nivel</label>
                                                        <select
                                                            id="proficiency"
                                                            name="proficiency"
                                                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                            <option value={0}>Nivel del idioma</option>
                                                            <option value={1}>Básico</option>
                                                            <option value={2}>Intermedio</option>
                                                            <option value={3}>Avanzado</option>
                                                            <option value={4}>Nativo</option>
                                                        </select>
                                                    </div>
                                                    <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                                                        <div className="star" data-index="1">
                                                            <img src="/assets/ic_outline_star.svg" alt="Star 1" className="star-icon w-6 h-6" />
                                                        </div>
                                                        <div className="star" data-index="2">
                                                            <img src="/assets/ic_outline_star.svg" alt="Star 2" className="star-icon w-6 h-6" />
                                                        </div>
                                                        <div className="star" data-index="3">
                                                            <img src="/assets/ic_outline_star.svg" alt="Star 3" className="star-icon w-6 h-6" />
                                                        </div>
                                                        <div className="star" data-index="4">
                                                            <img src="/assets/ic_outline_star.svg" alt="Star 4" className="star-icon w-6 h-6" />
                                                        </div>
                                                        <div className="star" data-index="5">
                                                            <img src="/assets/ic_outline_star.svg" alt="Star 5" className="star-icon w-6 h-6" />
                                                        </div>
                                                    </div>
                                                    <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => closeModal("modalLanguage")}
                                                            className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                            <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                            <p className="mx-auto">Cancelar</p>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                            <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                            <p className="mx-auto">Agregar</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Modal>
                                        </h2>
                                        <div className="flex flex-col">
                                            <LanguageCard data={languageData} />
                                            <LanguageCard data={languageData} />
                                            <LanguageCard data={languageData} />
                                        </div>
                                    </div>
                                    {/* Feedback */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2">
                                            Feedback
                                        </h2>
                                        <div className="flex flex-col">
                                            <FeedbackCard data={feedbackData} />
                                            <FeedbackCard data={feedbackData} />
                                            <FeedbackCard data={feedbackData} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openModal("modalFeedback")}
                                            className="text-[#52525B] text-sm rounded-lg my-2 p-2 hover:text-[#27272A] hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.05)] flex items-center gap-2 w-fit">
                                            <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            Dar nuevo feedback
                                        </button>
                                        <Modal id="modalFeedback" title="Agrega nuevo feedback">
                                            <div>
                                                <h3 className="text-[#71717A] text-sm mt-6">Agrega un nuevo puntaje y agrega un comentario.</h3>
                                                <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                                                    <div className="star" data-index="1">
                                                        <img src="/assets/ic_outline_star.svg" alt="Star 1" className="star-icon w-6 h-6" />
                                                    </div>
                                                    <div className="star" data-index="2">
                                                        <img src="/assets/ic_outline_star.svg" alt="Star 2" className="star-icon w-6 h-6" />
                                                    </div>
                                                    <div className="star" data-index="3">
                                                        <img src="/assets/ic_outline_star.svg" alt="Star 3" className="star-icon w-6 h-6" />
                                                    </div>
                                                    <div className="star" data-index="4">
                                                        <img src="/assets/ic_outline_star.svg" alt="Star 4" className="star-icon w-6 h-6" />
                                                    </div>
                                                    <div className="star" data-index="5">
                                                        <img src="/assets/ic_outline_star.svg" alt="Star 5" className="star-icon w-6 h-6" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col my-2">
                                                    <label htmlFor="feedback" className="text-[#37404c] text-base my-2">Feedback</label>
                                                    <textarea
                                                        name="feedback"
                                                        id="feedback"
                                                        placeholder="Agrega un comentario"
                                                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                    </textarea>
                                                </div>
                                                <div className="flex mt-6 gap-4 *:px-4 *:py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => closeModal("modalFeedback")}
                                                        className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                                                        <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                                                        <p className="mx-auto">Cancelar</p>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                                                        <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                                                        <p className="mx-auto">Agregar</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </Modal>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Dashboard>
        </div>
    );
}