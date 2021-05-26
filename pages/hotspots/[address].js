import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";
import RewardsChart from "../../components/Charts/RewardsChart";

const BONES_TO_HNT_CONVERSION = 0.00000001;
const Hotspot = ({ rewardsGrowth, totalRewards, accountTotal }) => {
    const router = useRouter();
    const { address } = router.query;
    const name = address
        ? animalHash(address)
        : "Failed to get hotspot address";
    console.log(name, rewardsGrowth);
    const lineChartData = rewardsGrowth.incrementedRewards;
    const dataLabels = rewardsGrowth.datesInOrder;

    //temp data printed
    const split = 0.5;
    const rewardsAfterSplit = totalRewards * split;
    const rewardsNotInAccountYet = rewardsAfterSplit - accountTotal;

    return (
        <>
            <p>
                Hotspot Address: <strong>{address}</strong>
            </p>
            <p>
                Name: <strong>{name}</strong>
            </p>
            <p>
                Hotspot Rewards all time: <strong>{totalRewards}</strong>
            </p>
            <p>
                Rewards Split: <strong>50%</strong>
            </p>
            <p>
                Rewards after split: <strong>{rewardsAfterSplit}</strong>
            </p>
            <p>
                Total currently in account: <strong>{accountTotal}</strong>
            </p>
            <p>
                Rewards yet to be paid:{" "}
                <strong>{rewardsNotInAccountYet}</strong>
            </p>
            <RewardsChart
                type="line"
                dataSetData={lineChartData}
                dataLabels={dataLabels}
            />
        </>
    );
};

async function getHotspotRewardsGrowth(
    address,
    prevRawRewards = [],
    cursorStr
) {
    if (cursorStr === null) {
        return incrementRewards(prevRawRewards);
    }
    let cursor = "";
    if (cursorStr) {
        cursor = `&cursor=${cursorStr}`;
    }
    const res = await fetch(
        `https://api.helium.io/v1/hotspots/${address}/rewards?max_time=2021-05-25&min_time=2021-05-17${cursor}`
    );
    const rawRewards = await res.json();
    const rewards = prevRawRewards.concat(rawRewards.data);
    return await getHotspotRewardsGrowth(
        address,
        rewards,
        rawRewards.cursor || null
    );
}

async function getTotalHotspotRewards(address) {
    const res = await fetch(
        `https://api.helium.io/v1/hotspots/${address}/rewards/sum?max_time=2021-05-25&min_time=2020-01-01`
    );
    const rawRewards = await res.json();
    return rawRewards.data.total;
}

async function getAccountBalance(address) {
    const conversion = BONES_TO_HNT_CONVERSION;
    const res = await fetch(`https://api.helium.io/v1/accounts/${address}`);
    const rawRewards = await res.json();
    return rawRewards.data.balance * conversion;
}

function incrementRewards(rawRewards) {
    const conversion = BONES_TO_HNT_CONVERSION;
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
export async function getServerSideProps({ query }) {
    debugger;
    const hotspotAddress = query.address;
    const accountAddress = query.account;
    const [rewardsGrowth, totalRewards, accountTotal] = await Promise.all([
        getHotspotRewardsGrowth(hotspotAddress),
        getTotalHotspotRewards(hotspotAddress),
        getAccountBalance(accountAddress),
    ]);

    console.log("rewards:", hotspotAddress, rewardsGrowth);

    return {
        props: {
            rewardsGrowth,
            totalRewards,
            accountTotal,
        },
    };
}

export default Hotspot;
