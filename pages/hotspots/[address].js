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
    const lineChartData = rewards.incrementingRewards;
    const dataLabels = rewards.datesInOrder;

    return (
        <>
            <p>Address: {address}</p>
            <p>Name: {name}</p>
            <LineChart dataSetData={lineChartData} dataLabels={dataLabels} />
        </>
    );
};

async function getHotspotRewards(
    address,
    prevRewards = { incrementingRewards: [], datesInOrder: [] },
    cursorStr
) {
    if (cursorStr === null) {
        return prevRewards;
    }
    let cursor = "";
    if (cursorStr) {
        cursor = `&cursor=${cursorStr}`;
    }
    const res = await fetch(
        `https://api.helium.io/v1/hotspots/${address}/rewards?max_time=2021-05-22&min_time=2021-05-01${cursor}`
    );
    const rawRewards = await res.json();
    const lastAmount = getLastAmount(prevRewards.incrementingRewards);
    const formattedRewardsData = formatRewardsData(rawRewards.data, lastAmount);
    const rewards = concatFormattedRewardsData(
        prevRewards,
        formattedRewardsData
    );
    return await getHotspotRewards(address, rewards, rawRewards.cursor || null);
}

function formatRewardsData(rewardsData, lastAmount) {
    const conversion = 0.00000001;
    let formattedRewardsData = {
        incrementingRewards: [],
        datesInOrder: [],
    };
    rewardsData.forEach((block, index) => {
        const prevIndex = index - 1;
        const prevTotal =
            prevIndex > -1
                ? formattedRewardsData.incrementingRewards[prevIndex]
                : lastAmount;
        const amountHnt = block.amount * conversion + prevTotal;
        formattedRewardsData.incrementingRewards.push(amountHnt);
        formattedRewardsData.datesInOrder.push(
            formatTimeStamp(block.timestamp)
        );
    });
    return formattedRewardsData;
}

function concatFormattedRewardsData(prevRewards, formattedRewardsData) {
    return {
        incrementingRewards: prevRewards.incrementingRewards.concat(
            formattedRewardsData.incrementingRewards
        ),
        datesInOrder: prevRewards.datesInOrder.concat(
            formattedRewardsData.datesInOrder
        ),
    };
}

function getLastAmount(incrementingRewards) {
    if (incrementingRewards.length === 0) {
        return 0;
    }
    return incrementingRewards[incrementingRewards.length - 1];
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
