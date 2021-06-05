import Image from 'next/image';

const Loading = () => {
    return (
        <div className="w-full h-full fixed block top-0 left-0 bg-white opacity-75 z-50">
            <span className="text-green-500 opacity-75 top-1/2 my-0 mx-auto block relative w-0 h-0">
                <img
                    className="transform -translate-x-1/2 -translate-y-1/2 max-w-none"
                    src="/rings.svg"
                    alt="Loading..."
                    style={{ width: 200 + 'px' }}
                />
            </span>
        </div>
    );
};

export default Loading;
