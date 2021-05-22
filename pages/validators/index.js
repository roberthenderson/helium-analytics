import Head from "next/head";
import styles from "../../styles/Home.module.css";
import Select from "react-select";
import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";

function Validators({ validators }) {
    const router = useRouter();
    const handleChange = (validator) => {
        router.push(`/validators/${validator.value}`);
    };
    return (
        <div className={styles.container}>
            <Head>
                <title>Helium Testnet Validators</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Helium Testnet Validators</h1>
                <Select
                    className={styles.validatorDropdown}
                    instanceId="select-a-validator"
                    options={validators}
                    onChange={handleChange}
                ></Select>
            </main>

            <footer className={styles.footer}>Built by Robert</footer>
        </div>
    );
}

function _formatValidators(rawValidatorsData) {
    let formattedValidators = [];
    rawValidatorsData.forEach((validator) => {
        formattedValidators.push({
            label: animalHash(validator.address),
            value: validator.address,
        });
    });
    return formattedValidators;
}

// This function gets called at build time
export async function getStaticProps() {
    const res = await fetch("https://testnet-api.helium.wtf/v1/validators");
    const rawValidators = await res.json();
    const validators = _formatValidators(rawValidators.data);
    // console.log("Validators:", validators);

    // By returning { props: { validators } }, the Blog component
    // will receive `validators` as a prop at build time
    return {
        props: {
            validators,
        },
    };
}

export default Validators;
