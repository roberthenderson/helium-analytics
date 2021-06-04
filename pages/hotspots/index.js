import Head from 'next/head';
import Select from 'react-select';
import { useRouter } from 'next/router';
import animalHash from 'angry-purple-tiger';
import PropTypes from 'prop-types';

function Hotspots({ hotspots }) {
    Hotspots.propTypes = {
        hotspots: PropTypes.array.isRequired
    };
    const router = useRouter();
    const handleChange = (hotspot) => {
        router.push(`/hotspots/${hotspot.dashed}`);
    };
    return (
        <div>
            <Head>
                <title>Helium Hotspots</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1>Helium Hotspots</h1>
                <Select
                    instanceId="select-a-hotspot"
                    options={hotspots}
                    onChange={handleChange}></Select>
            </main>

            <footer>Built by Robert</footer>
        </div>
    );
}

function _formatHotspots(rawHotspotsData) {
    let formattedHotspots = [];
    rawHotspotsData.forEach((hotspot) => {
        if (hotspot.address) {
            let hotspotName = animalHash(hotspot.address);
            let hotspotDashed = dashHotspotName(hotspotName);
            formattedHotspots.push({
                label: animalHash(hotspot.address),
                dashed: hotspotDashed,
                value: hotspot.address
            });
        }
    });
    return formattedHotspots;
}

function dashHotspotName(hotspotName) {
    return hotspotName.toLowerCase().replaceAll(' ', '-');
}

// This function gets called at build time
export async function getServerSideProps() {
    const res = await fetch('https://api.helium.io/v1/hotspots');
    const rawHotspots = await res.json();
    const hotspots = _formatHotspots(rawHotspots.data);
    // console.log("hotspots:", hotspots);

    return {
        props: {
            hotspots
        }
    };
}

export default Hotspots;
