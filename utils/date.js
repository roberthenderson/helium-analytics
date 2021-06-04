const DateUtils = {
    convertDateToGMT(dateStr, isMaxDate) {
        if (!dateStr) {
            dateStr = this.createDateStr(isMaxDate);
        }
        const timeStr = isMaxDate ? '23:59:59' : '00:00:00';
        const date = new Date(`${dateStr} ${timeStr}`);
        return this.formatDateForAPI(date);
    },
    createDateStr(isMaxDate) {
        const today = new Date();
        let aWeekAgo = new Date();
        aWeekAgo.setDate(new Date().getDate() - 7);
        const date = isMaxDate
            ? this.addLeadingZero(today.getDate())
            : this.addLeadingZero(aWeekAgo.getDate());
        const month = isMaxDate
            ? this.addLeadingZero(today.getMonth() + 1)
            : this.addLeadingZero(aWeekAgo.getMonth() + 1);
        return `${today.getFullYear()}-${month}-${date}`;
    },
    addLeadingZero(numStr) {
        return `0${numStr}`.slice(-2);
    },
    formatDateForAPI(date) {
        const dateStrMap = {
            year: date.getUTCFullYear(),
            month: ('0' + (date.getUTCMonth() + 1)).slice(-2),
            date: ('0' + date.getUTCDate()).slice(-2),
            hours: ('0' + date.getUTCHours()).slice(-2),
            minutes: ('0' + date.getUTCMinutes()).slice(-2),
            seconds: ('0' + date.getUTCSeconds()).slice(-2)
        };
        let dateStr = '';
        Object.keys(dateStrMap).forEach((key) => {
            const value = dateStrMap[key];
            dateStr += value;
            if (key === 'year' || key === 'month') {
                dateStr += '-';
            }
            if (key === 'date') {
                dateStr += 'T';
            }
            if (key === 'hours' || key === 'minutes') {
                dateStr += ':';
            }
        });
        return dateStr + '.000000Z';
    }
};

export default DateUtils;
