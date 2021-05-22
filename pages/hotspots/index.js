import Head from "next/head";
import styles from "../../styles/Home.module.css";
import Select from "react-select";
import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";

function Hotspots({ hotspots }) {
    const router = useRouter();
    const handleChange = (hotspot) => {
        router.push(`/hotspots/${hotspot.value}`);
    };
    return (
        <div className={styles.container}>
            <Head>
                <title>Helium Hotspots</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Helium Hotspots</h1>
                <Select
                    className={styles.validatorDropdown}
                    instanceId="select-a-hotspot"
                    options={hotspots}
                    onChange={handleChange}
                ></Select>
            </main>

            <footer className={styles.footer}>Built by Robert</footer>
        </div>
    );
}

function _formatHotspots(rawHotspotsData) {
    let formattedHotspots = [];
    rawHotspotsData.forEach((hotspot) => {
        if (hotspot.address) {
            formattedHotspots.push({
                label: animalHash(hotspot.address),
                value: hotspot.address,
            });
        }
    });
    return formattedHotspots;
}

// This function gets called at build time
export async function getServerSideProps() {
    const res = await fetch("https://api.helium.io/v1/hotspots");
    const rawHotspots = await res.json();
    const hotspots = _formatHotspots(rawHotspots.data);
    // console.log("hotspots:", hotspots);

    return {
        props: {
            hotspots,
        },
    };
}

export default Hotspots;
