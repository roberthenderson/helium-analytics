import { useRouter } from 'next/router';
import { useSWRInfinite } from 'swr';
import Constants from '../utils/constants';
import DateUtils from '../utils/date';
import fetcher from '../utils/fetcher';

const heliumHotspotAPI = 'https://api.helium.io/v1/hotspots/';

export const useHotspotRewards = (address) => {
    if (!address) {
        return;
    }

    const router = useRouter();
    const minDate = DateUtils.convertDateToGMT(router.query.minDate);
    const maxDate = DateUtils.convertDateToGMT(router.query.maxDate, true);
    const dateRange = { minDate, maxDate };
    const endpoint = `${heliumHotspotAPI + address}/rewards?min_time=${
        dateRange.minDate
    }&max_time=${dateRange.maxDate}`;
    const getKey = (pageIndex, previousPageData) => {
        // reached the end
        if (previousPageData && !previousPageData.data) return null;

        // first page, we don't have `previousPageData`
        if (pageIndex === 0) return endpoint;

        // add the cursor to the API endpoint
        const cursorEndpoint = `${endpoint}&cursor=${previousPageData.cursor}`;
        return cursorEndpoint;
    };
    const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher, {
        initialSize: 2
    });

    const incrementRewards = (rawRewards) => {
        const conversion = Constants.BONES_TO_HNT_CONVERSION;
        let formattedRewardsData = {
            incrementedRewards: [],
            datesInOrder: []
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
                DateUtils.formatTimeStampForDisplay(rawRewards[i].timestamp)
            );
        }
        return formattedRewardsData;
    };
    let rewards;
    if (data) {
        let rawRewards;
        data.forEach((result) => {
            rawRewards = [].concat(result.data);
        });
        rewards = incrementRewards(rawRewards);
    }
    const isLoadingInitialData = !data && !error;
    const isLoadingMore =
        isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');

    return { rewards, error, isLoadingMore, size, setSize };
};
