import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

import Header from "../components/header/header"
import EntryForm from "../components/entry/entry-form";

import '../css/entry.css'

export default function Entry() {
    const [active, setActive] = useState("auth");

    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const [recoverySuccess, setRecoverySuccess] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();

    useEffect(() => {
    if (!loading && user) {
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get("redirect");
        if (redirect) {
            navigate(redirect);
        } else {
            navigate('/start', { replace: true });
        }
    }
    }, [user, loading, navigate, location]);
    return (
        <main>
            <Header hideIconsAndLogo={true}/>
            <EntryForm
                type={active}
                active={active}
                setActive={setActive}

                registrationSuccess={registrationSuccess}
                setRegistrationSuccess={setRegistrationSuccess}
                registeredEmail={registeredEmail}
                setRegisteredEmail={setRegisteredEmail}
                
                recoverySuccess={recoverySuccess}
                setRecoverySuccess={setRecoverySuccess}
                recoveryEmail = {recoveryEmail}
                setRecoveryEmail = {setRecoveryEmail}
            />
        </main>
    );
}