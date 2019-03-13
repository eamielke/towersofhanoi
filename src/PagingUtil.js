export const composePage = (dataArray, pageSize, pageNo) => {
    return (dataArray.slice(pageNo * pageSize, pageNo * pageSize + pageSize));
};

export const calcTotalPages = (dataArray, pageSize) => {
    return Math.ceil(dataArray.length / pageSize);
};


