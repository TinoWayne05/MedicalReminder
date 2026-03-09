import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa6';

const FloatingActionButton = () => {
    const navigate = useNavigate();
    return (
        <button className="fab" onClick={() => navigate('/add')} aria-label="Add Medication">
            <FaPlus />
        </button>
    );
};

export default FloatingActionButton;
