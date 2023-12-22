import React from 'react';
import { CSSProperties } from 'react';

interface DividerProps {
    children: React.ReactNode;
}

const dividerContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '120px',
    margin: '0 auto',
    padding: '8px 0',
};

const dividerBorderStyle: CSSProperties = {
    borderBottom: '1px solid gray',
    width: '100%',
};

const dividerTextStyle: CSSProperties = {
    padding: '0 10px',
    color: 'gray',
};

const Divider: React.FC<DividerProps> = ({ children }) => {
    return (
        <div style={dividerContainerStyle}>
            <div style={dividerBorderStyle} />
            <span style={dividerTextStyle}>{children}</span>
            <div style={dividerBorderStyle} />
        </div>
    );
};

export default Divider;