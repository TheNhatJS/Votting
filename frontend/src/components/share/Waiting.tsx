import React from 'react';

const Waiting = ({ fill }: { fill?: string }) => {
    return (
        <div className="z-[100] flex justify-center items-center gap-1">
            <div className="loading-spinner-circle" style={{ borderTopColor: fill ? fill : "#f8f8f8" }}></div>
        </div>
    );
};

export default Waiting;