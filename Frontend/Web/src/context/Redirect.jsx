import React, { useContext } from 'react'
import { AppContext } from './AppContext'
import { Navigate } from 'react-router-dom'

export default function Redirect() {
    const {role, token} = useContext(AppContext)
    return (
    <>
        {token == null && (
            <>
                <Navigate to={'/login'} replace={true} />
                {role == null ? (
                    <Navigate to={'/login'} replace={true} />
                ) : (
                    <>
                    {role != null && (
                        <Navigate to={`/${role}`} replace={true} />
                    )}
                    </>
                )}
            </>
        )}
    </>
    )
}

export function RoleCheck(){
    return (
        <>
            {/* <AdminRedirect /> */}
            <EmployerRedirect />
            <ApplicantRedirect />
        </>
    )
}
export function AdminRedirect(){
    const {role} = useContext(AppContext)
    return(
        <>
        {role == 'Admin' && (<Navigate to={'/admin'} replace={true} />)}
        </>
    )
}

export function EmployerRedirect(){
    const {role} = useContext(AppContext)
    return(
        <>
        {role == 'Employer' && (<Navigate to={'/employer'} replace={true} />)}
        </>
    )
}

export function ApplicantRedirect(){
    const {role} = useContext(AppContext)
    return(
        <>
        {role == 'Applicant' && (<Navigate to={'/applicant'} replace={true} />)}
        </>
    )
}