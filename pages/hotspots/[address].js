import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";
import Datepicker from "../../components/Actions/Datepicker";
import RewardsChart from "../../components/Charts/RewardsChart";

const BONES_TO_HNT_CONVERSION = 0.00000001;
const Hotspot = ({
    hotspotName,
    rewardsGrowth,
    totalRewards,
    accountTotal,
}) => {
    const router = useRouter();
    const { address } = router.query;
    console.log(hotspotName, rewardsGrowth);
    const lineChartData = rewardsGrowth.incrementedRewards;
    const dataLabels = rewardsGrowth.datesInOrder;

    //temp data printed
    const split = 0.5;
    const rewardsAfterSplit = totalRewards * split;
    const rewardsNotInAccountYet = rewardsAfterSplit - accountTotal;

    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <main>
                        <p>
                            Hotspot Address: <strong>{address}</strong>
                        </p>
                        <p>
                            Name: <strong>{hotspotName}</strong>
                        </p>
                        <p>
                            Hotspot Rewards for date range:{" "}
                            <strong>{totalRewards}</strong>
                        </p>
                        <p>
                            Rewards Split: <strong>50%</strong>
                        </p>
                        <p>
                            Rewards after split:{" "}
                            <strong>{rewardsAfterSplit}</strong>
                        </p>
                        <p>
                            Total currently in account:{" "}
                            <strong>{accountTotal}</strong>
                        </p>
                        {/* <p>
                            Rewards yet to be paid:{" "}
                            <strong>{rewardsNotInAccountYet}</strong>
                        </p> */}
                        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                                <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                                    <Datepicker />
                                </div>
                            </div>
                        </div>
                        <RewardsChart
                            type="line"
                            dataSetData={lineChartData}
                            dataLabels={dataLabels}
                        />
                    </main>
                </div>
            </div>
        </>
    );
};

async function getHotspotRewardsGrowth(
    address,
    dateRange,
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
    const endpoint = `https://api.helium.io/v1/hotspots/${address}/rewards?min_time=${dateRange.minDate}&max_time=${dateRange.maxDate}${cursor}`;
    const res = await fetch(endpoint);
    const rawRewards = await res.json();
    const rewards = prevRawRewards.concat(rawRewards.data);
    return await getHotspotRewardsGrowth(
        address,
        dateRange,
        rewards,
        rawRewards.cursor || null
    );
}

async function getTotalHotspotRewards(address, dateRange) {
    const endpoint = `https://api.helium.io/v1/hotspots/${address}/rewards/sum?max_time=${dateRange.maxDate}&min_time=${dateRange.minDate}`;
    const res = await fetch(endpoint);
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
    const date = new Date(timestamp.slice(0, -1));
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${(
        "0" + date.getHours()
    ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
}

// This function gets called at build time
export async function getServerSideProps({ query }) {
    const hotspotAddress = query.address;
    const hotspotName = hotspotAddress
        ? animalHash(hotspotAddress)
        : "Failed to get hotspot address";
    const accountAddress = query.account;
    const minDate = query.minDate;
    const maxDate = query.maxDate;
    const [rewardsGrowth, totalRewards, accountTotal] = await Promise.all([
        getHotspotRewardsGrowth(hotspotAddress, { minDate, maxDate }),
        getTotalHotspotRewards(hotspotAddress, { minDate, maxDate }),
        getAccountBalance(accountAddress),
    ]);

    console.log("rewards:", hotspotAddress, rewardsGrowth);

    return {
        props: {
            hotspotName,
            rewardsGrowth,
            totalRewards,
            accountTotal,
        },
    };
}

export default Hotspot;
