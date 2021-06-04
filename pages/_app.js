import React, { useState } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import Loading from '../components/Global/Loading';
import Layout from '../components/Global/Layout';
import '../styles/globals.scss';
import PropTypes from 'prop-types';

const HeliumAnalytics = ({ Component, pageProps }) => {
    HeliumAnalytics.propTypes = {
        Component: PropTypes.node.isRequired,
        pageProps: PropTypes.node.isRequired
    };
    const [loading, setLoading] = useState(false);

    Router.events.on('routeChangeStart', () => {
        setLoading(true);
    });
    Router.events.on('routeChangeComplete', () => {
        setLoading(false);
    });

    return (
        <>
            <Head>
                <title>Helium Analytics</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout {...pageProps}>
                <Component {...pageProps} />
            </Layout>
            {loading && <Loading />}
        </>
    );
};

export default HeliumAnalytics;
