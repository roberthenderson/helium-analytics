import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";
import LineChart from "../../components/Charts/LineChart";

const Hotspot = ({ rewards }) => {
    const router = useRouter();
    const { address } = router.query;
    const name = address
        ? animalHash(address)
        : "Failed to get hotspot address";
    console.log(name, rewards);
    const lineChartData = rewards.incrementedRewards;
    const dataLabels = rewards.datesInOrder;

    return (
        <>
            <p>Address: {address}</p>
            <p>Name: {name}</p>
            <LineChart dataSetData={lineChartData} dataLabels={dataLabels} />
        </>
    );
};

async function getHotspotRewards(address, prevRawRewards = [], cursorStr) {
    if (cursorStr === null) {
        return incrementRewards(prevRawRewards);
    }
    let cursor = "";
    if (cursorStr) {
        cursor = `&cursor=${cursorStr}`;
    }
    const res = await fetch(
        `https://api.helium.io/v1/hotspots/${address}/rewards?max_time=2021-05-24&min_time=2021-05-17${cursor}`
    );
    const rawRewards = await res.json();
    const rewards = prevRawRewards.concat(rawRewards.data);
    return await getHotspotRewards(address, rewards, rawRewards.cursor || null);
}

function incrementRewards(rawRewards) {
    const conversion = 0.00000001;
    let formattedRewardsData = {
        incrementedRewards: [],
        datesInOrder: [],
    };
    // Most recent rewards are first, so we need to loop backwards
    for (let i = rawRewards.length - 1; i >= 0; i--) {
        const amount = rawRewards[i].amount;
        const prevAmount =
            formattedRewardsData.incrementedRewards[
                formattedRewardsData.incrementedRewards.length - 1
            ] || 0;
        const amountHnt = amount * conversion + prevAmount;
        formattedRewardsData.incrementedRewards.push(amountHnt);
        formattedRewardsData.datesInOrder.push(
            formatTimeStamp(rawRewards[i].timestamp)
        );
    }
    return formattedRewardsData;
}

function formatTimeStamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// This function gets called at build time
export async function getServerSideProps({ params }) {
    const address = params.address;
    const rewards = await getHotspotRewards(address);
    console.log("rewards:", address, rewards);

    return {
        props: {
            rewards,
        },
    };
}

export default Hotspot;
