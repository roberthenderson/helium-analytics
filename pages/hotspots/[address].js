import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";

const Hotspot = ({ hotspot }) => {
    const router = useRouter();
    const { address } = router.query;
    const name = address
        ? animalHash(address)
        : "Failed to get hotspot address";
    console.log(name, hotspot);

    return (
        <>
            <p>Address: {address}</p>
            <p>Name: {name}</p>
        </>
    );
};

// This function gets called at build time
export async function getServerSideProps({ params }) {
    const address = params.address;
    debugger;
    const res = await fetch(`https://api.helium.io/v1/hotspots/${address}`);
    const hotspot = await res.json();
    // const hotspot = _formatHotspots(rawHotspot.data);
    console.log("hotspot:", address, hotspot);

    return {
        props: {
            hotspot,
        },
    };
}

export default Hotspot;
