import type { JSX } from '@emotion/react/jsx-runtime'
import React from 'react'
import { Navigate } from 'react-router-dom';

interface ProtectedProps {
    children: JSX.Element
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to='/' />
}

export default ProtectedRoute