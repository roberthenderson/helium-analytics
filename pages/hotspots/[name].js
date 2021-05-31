import { useRouter } from "next/router";
import Utils from "../../utils/utils";
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
    if (!dateRange) {
        return;
    }
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
            formatTimeStampForDisplay(rawRewards[i].timestamp)
        );
    }
    return formattedRewardsData;
}

function formatTimeStampForDisplay(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${(
        "0" + date.getHours()
    ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
}

function formatDateForAPI(date) {
    const dateStrMap = {
        year: date.getFullYear(),
        month: ("0" + (date.getMonth() + 1)).slice(-2),
        date: ("0" + date.getDate()).slice(-2),
        hours: ("0" + date.getHours()).slice(-2),
        minutes: ("0" + date.getMinutes()).slice(-2),
        seconds: ("0" + date.getSeconds()).slice(-2),
    };
    let dateStr = "";
    Object.keys(dateStrMap).forEach((key) => {
        const value = dateStrMap[key];
        dateStr += value;
        if (key === "year" || key === "month") {
            dateStr += "-";
        }
        if (key === "date") {
            dateStr += "T";
        }
        if (key === "hours" || key === "minutes") {
            dateStr += ":";
        }
    });
    return dateStr + ".000000Z";
}

function convertDateToGMT(dateStr, isMaxDate) {
    if (!dateStr) {
        dateStr = createDateStr(isMaxDate);
    }
    const timeStr = isMaxDate ? "23:59:59" : "00:00:00";
    const date = new Date(`${dateStr} ${timeStr}`);
    return formatDateForAPI(date);
}

function createDateStr(isMaxDate) {
    const today = new Date();
    let aWeekAgo = new Date();
    aWeekAgo.setDate(new Date().getDate() - 7);
    const date = isMaxDate
        ? Utils.lz(today.getDate())
        : Utils.lz(aWeekAgo.getDate());
    return `${today.getFullYear()}-${Utils.lz(today.getMonth() + 1)}-${date}`;
}

async function getHotspotAddress(hotspotName) {
    const res = await fetch(
        `https://api.helium.io/v1/hotspots/name?search=${hotspotName}`
    );
    const hotspots = await res.json();
    // hotspots.data.forEach((hotspot) => {
    for (let i = 0; i < hotspots.data.length; i++) {
        let hotspot = hotspots.data[i];
        if (hotspot.name === hotspotName) {
            return hotspot.address;
        }
    }
    return null;
}

// This function gets called at build time
export async function getServerSideProps({ query }) {
    const hotspotName = query.name;
    const hotspotAddress = await getHotspotAddress(hotspotName);
    const accountAddress = query.account;
    debugger;
    const minDate = convertDateToGMT(query.minDate);
    const maxDate = convertDateToGMT(query.maxDate, true);
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
