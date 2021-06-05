import Datepicker from '../../components/Actions/Datepicker';
import RewardsChart from '../../components/Charts/RewardsChart';
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import { useRouter } from 'next/router';
import Constants from '../../utils/constants';

const HotspotName = () => {
    const router = useRouter();
    const hotspotName = router.query.name;
    const url = `https://api.helium.io/v1/hotspots/name?search=${hotspotName}`;
    const { data: result, error } = useSWR(url, fetcher);
    if (!result || (result && result.data && result.data.length === 0)) {
        return <>Loading...</>;
    }
    const hotspotAddress = getHotspotAddressFromSearchResults(result, hotspotName);
    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <main>
                        <p>
                            Hotspot Address: <strong>{hotspotAddress}</strong>
                        </p>
                        <p>
                            Name: <strong>{prettifyHotspotName(hotspotName)}</strong>
                        </p>
                        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                                <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                                    <Datepicker />
                                </div>
                            </div>
                        </div>
                        <RewardsChart type="line" hotspotAddress={hotspotAddress} />
                    </main>
                </div>
            </div>
        </>
    );
};

async function getTotalHotspotRewards(address, dateRange) {
    if (!dateRange) {
        return;
    }
    const endpoint = `https://api.helium.io/v1/hotspots/${address}/rewards/sum?min_time=${dateRange.minDate}&max_time=${dateRange.maxDate}`;
    const res = await fetch(endpoint);
    const rawRewards = await res.json();
    return rawRewards.data.total;
}

async function getAccountBalance(address) {
    const conversion = Constants.BONES_TO_HNT_CONVERSION;
    const res = await fetch(`https://api.helium.io/v1/accounts/${address}`);
    const rawRewards = await res.json();
    return rawRewards.data.balance * conversion;
}

function prettifyHotspotName(hotspotName) {
    if (!hotspotName) return;
    return hotspotName
        .split('-')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.substr(1);
        })
        .join(' ');
}

function getHotspotAddressFromSearchResults(hotspots, hotspotName) {
    for (let i = 0; i < hotspots.data.length; i++) {
        let hotspot = hotspots.data[i];
        if (hotspot.name === hotspotName) {
            return hotspot.address;
        }
    }
    return null;
}

export default HotspotName;
