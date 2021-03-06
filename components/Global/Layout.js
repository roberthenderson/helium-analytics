import Header from './Header';
import PropTypes from 'prop-types';

const Layout = ({ children }) => {
    Layout.propTypes = {
        children: PropTypes.node.isRequired
    };
    return (
        <>
            <div className="layout min-h-screen bg-gray-100">
                <Header />
                <main>
                    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </>
    );
};

export default Layout;
